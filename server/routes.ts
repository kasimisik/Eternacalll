import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { Webhook } from 'svix';
import { db } from './db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { azureSpeechService } from './azure-speech';
import { elevenLabsTTSService } from './elevenlabs-tts';
import multer from 'multer';
import WebSocket, { WebSocketServer } from 'ws';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

// Multer konfigürasyonu ses dosyaları için
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Using Drizzle ORM instead of Prisma

  // Clerk config endpoint
  app.get('/api/config/clerk', (req, res) => {
    res.json({
      publishableKey: process.env.CLERK_PUBLISHABLE_KEY || ""
    });
  });

  // Clerk Webhook endpoint
  app.post('/api/webhooks/clerk', async (req, res) => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      return res.status(500).json({ error: 'CLERK_WEBHOOK_SECRET not found' });
    }

    // Get the headers
    const svix_id = req.headers["svix-id"] as string;
    const svix_timestamp = req.headers["svix-timestamp"] as string;
    const svix_signature = req.headers["svix-signature"] as string;

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).json({ error: 'Error occured -- no svix headers' });
    }

    // Get the body
    const payload = JSON.stringify(req.body);
    const body = req.body;

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: any;

    // Verify the payload with the headers
    try {
      evt = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as any;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return res.status(400).json({ error: 'Error occured' });
    }

    // Do something with the payload
    const { id } = evt?.data;
    const eventType = evt?.type;

    console.log(`Webhook with and ID of ${id} and type of ${eventType}`);
    console.log('Webhook body:', body);

    if (eventType === 'user.created') {
      try {
        const { id, email_addresses } = evt.data;
        
        // Kullanıcıyı veritabanına ekle
        await db.insert(users).values({
          clerkUserId: id,
          email: email_addresses[0]?.email_address || '',
        });

        console.log(`User ${id} added to database`);
      } catch (error) {
        console.error('Error adding user to database:', error);
        return res.status(500).json({ error: 'Error adding user to database' });
      }
    }

    res.status(200).json({ received: true });
  });

  // Test NOWPayments API Status
  app.get('/api/payment/test-nowpayments', async (req, res) => {
    const API_KEY = process.env.NOWPAYMENTS_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({ error: 'NOWPAYMENTS_API_KEY not found in environment variables' });
    }
    
    console.log('=== TESTING NOWPAYMENTS API STATUS ===');
    
    try {
      // Test with status endpoint first
      const statusResponse = await fetch('https://api.nowpayments.io/v1/status', {
        method: 'GET',
        headers: {
          'x-api-key': API_KEY,
        }
      });
      
      console.log('Status endpoint response:', statusResponse.status);
      const statusResult = await statusResponse.json();
      console.log('Status result:', JSON.stringify(statusResult, null, 2));
      
      if (!statusResponse.ok) {
        return res.json({ 
          error: 'API Key test failed', 
          status: statusResponse.status,
          details: statusResult 
        });
      }
      
      res.json({ 
        success: true, 
        apiKeyValid: true,
        statusResult 
      });
    } catch (error) {
      console.log('API test error:', error);
      res.status(500).json({ error: 'API test failed', details: String(error) });
    }
  });

  // NOWPayments Create Crypto Payment API  
  app.post('/api/payment/create-crypto-payment', async (req, res) => {
    console.log('=== CRYPTO PAYMENT REQUEST STARTED ===');
    
    const API_KEY = process.env.NOWPAYMENTS_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({ error: 'NOWPAYMENTS_API_KEY not found in environment variables' });
    }
    
    console.log('Using NOWPayments API Key from environment');

    try {
      // First test if API key works with status endpoint
      const statusTest = await fetch('https://api.nowpayments.io/v1/status', {
        method: 'GET',
        headers: {
          'x-api-key': API_KEY,
        }
      });
      
      console.log('API Key status test:', statusTest.status);
      
      if (!statusTest.ok) {
        const statusError = await statusTest.json();
        console.log('API Key validation failed:', statusError);
        return res.status(400).json({ 
          error: 'API Key geçersiz - NOWPayments hesabını kontrol et',
          details: statusError 
        });
      }
      
      const paymentData = {
        price_amount: 60,
        price_currency: 'usd',
        pay_currency: 'btc',
        order_id: `USER_${Date.now()}`,
        order_description: 'Profesyonel Plan Üyeliği',
        success_url: `${req.protocol}://${req.get('host')}/dashboard`,
        ipn_callback_url: `${req.protocol}://${req.get('host')}/api/payment/crypto-webhook`
      };

      console.log('Creating invoice with data:', JSON.stringify(paymentData, null, 2));

      const response = await fetch('https://api.nowpayments.io/v1/invoice', {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      console.log('Invoice Response status:', response.status);

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.log('JSON parse error:', parseError);
        const text = await response.text();
        console.log('Raw response text:', text);
        return res.status(500).json({ error: 'Invalid JSON response from NOWPayments' });
      }
      
      console.log('Invoice response:', JSON.stringify(result, null, 2));
      
      if (!response.ok) {
        console.log('Invoice creation failed');
        return res.status(400).json({ error: 'Payment creation failed', details: result });
      }

      // Check for invoice_url 
      if (result.invoice_url) {
        console.log('SUCCESS: Invoice URL found:', result.invoice_url);
        return res.json({ paymentUrl: result.invoice_url });
      } else {
        console.log('Available fields:', Object.keys(result));
        return res.status(400).json({ 
          error: 'No payment URL received', 
          response: result 
        });
      }
    } catch (error) {
      console.log('CATCH ERROR:', error);
      res.status(500).json({ error: 'Internal server error', details: String(error) });
    }
  });

  // NOWPayments Crypto Webhook
  app.post('/api/payment/crypto-webhook', async (req, res) => {
    const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;
    
    if (!IPN_SECRET) {
      return res.status(500).json({ error: 'NOWPAYMENTS_IPN_SECRET not found' });
    }

    try {
      // Get the signature from headers
      const receivedSignature = req.headers['x-nowpayments-sig'] as string;
      
      if (!receivedSignature) {
        return res.status(400).json({ error: 'Missing signature header' });
      }

      // Verify the webhook signature
      const payload = JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha512', IPN_SECRET)
        .update(payload)
        .digest('hex');

      if (receivedSignature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return res.status(400).json({ error: 'Invalid signature' });
      }

      const { payment_status, order_id } = req.body;

      console.log(`Webhook received: Payment ${order_id} status: ${payment_status}`);

      // If payment is completed
      if (payment_status === 'finished') {
        try {
          // Find user by order_id (in this case it's the user ID)
          const [user] = await db.select().from(users).where(eq(users.clerkUserId, order_id)).limit(1);

          if (user) {
            // Update user subscription to Professional Plan
            await db.update(users)
              .set({ subscription: 'Profesyonel Plan' })
              .where(eq(users.id, user.id));

            console.log(`User ${order_id} subscription updated to Profesyonel Plan`);
          } else {
            console.log(`User ${order_id} not found`);
          }
        } catch (dbError) {
          console.error('Database error:', dbError);
          return res.status(500).json({ error: 'Database update failed' });
        }
      }

      res.status(200).json({ status: 'success' });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  // Shopier Create Payment API
  app.post('/api/payment/create-shopier-payment', async (req, res) => {
    console.log('=== SHOPIER PAYMENT REQUEST STARTED ===');
    
    const API_KEY = process.env.SHOPIER_API_KEY;
    const API_SECRET = process.env.SHOPIER_API_SECRET;
    
    if (!API_KEY || !API_SECRET) {
      return res.status(500).json({ error: 'SHOPIER_API_KEY or SHOPIER_API_SECRET not found in environment variables' });
    }
    
    try {
      const { userId, userEmail, userName } = req.body;
      
      if (!userId || !userEmail || !userName) {
        return res.status(400).json({ 
          error: 'Kullanıcı bilgileri eksik', 
          required: ['userId', 'userEmail', 'userName'] 
        });
      }

      // Shopier ödeme parametreleri
      const paymentData = {
        API_key: API_KEY,
        website_index: 1,
        platform_order_id: `ORDER_${Date.now()}_${userId}`,
        product_name: 'Profesyonel Plan Üyeliği',
        product_type: 2, // Dijital ürün
        buyer_name: userName.split(' ')[0] || 'Ad',
        buyer_surname: userName.split(' ').slice(1).join(' ') || 'Soyad',
        buyer_email: userEmail,
        buyer_phone: '5555555555', // Varsayılan telefon
        buyer_account_age: 1,
        buyer_id_nr: userId,
        buyer_address: 'Türkiye',
        buyer_city: 'İstanbul',
        buyer_country: 'Turkey',
        buyer_postcode: '34000',
        shipping_address: 'Türkiye',
        shipping_city: 'İstanbul', 
        shipping_country: 'Turkey',
        shipping_postcode: '34000',
        total_order_value: '60.00',
        currency: 'TRY',
        platform_order_url: `${req.protocol}://${req.get('host')}/dashboard`,
        callback_url: `${req.protocol}://${req.get('host')}/api/payment/shopier-callback`,
        random_nr: Math.random().toString(36).substring(2, 15)
      };

      console.log('Shopier Payment Data:', JSON.stringify(paymentData, null, 2));

      // Shopier imza oluşturma
      const signatureString = `${paymentData.random_nr}${paymentData.platform_order_id}${paymentData.total_order_value}${paymentData.currency}`;
      const signature = crypto
        .createHmac('sha256', API_SECRET)
        .update(signatureString)
        .digest('base64');

      (paymentData as any).signature = signature;

      // Shopier ödeme formu HTML'i oluştur
      const formHTML = `
        <html>
          <head>
            <title>Shopier Ödeme</title>
            <meta charset="utf-8">
          </head>
          <body>
            <form method="POST" action="https://www.shopier.com/ShowProduct/api_pay4.php" id="shopier_payment_form">
              ${Object.entries(paymentData).map(([key, value]) => 
                `<input type="hidden" name="${key}" value="${value}">`
              ).join('\n')}
              <script>document.getElementById('shopier_payment_form').submit();</script>
            </form>
          </body>
        </html>
      `;

      console.log('Shopier form generated successfully');
      res.json({ 
        success: true,
        paymentFormHTML: formHTML,
        orderId: paymentData.platform_order_id
      });

    } catch (error) {
      console.error('Shopier payment error:', error);
      res.status(500).json({ error: 'Shopier ödeme oluşturulamadı', details: String(error) });
    }
  });

  // Shopier Payment Callback
  app.post('/api/payment/shopier-callback', async (req, res) => {
    console.log('=== SHOPIER CALLBACK RECEIVED ===');
    console.log('Callback data:', JSON.stringify(req.body, null, 2));
    
    const API_SECRET = process.env.SHOPIER_API_SECRET;
    
    if (!API_SECRET) {
      return res.status(500).json({ error: 'SHOPIER_API_SECRET not found in environment variables' });
    }
    
    try {
      const { 
        status, 
        platform_order_id, 
        payment_id, 
        total_order_value,
        currency,
        random_nr,
        signature 
      } = req.body;

      // Shopier imza doğrulama
      const expectedSignature = crypto
        .createHmac('sha256', API_SECRET)
        .update(`${random_nr}${platform_order_id}${total_order_value}${currency}`)
        .digest('base64');

      if (signature !== expectedSignature) {
        console.error('Invalid Shopier signature');
        return res.status(400).json({ error: 'Invalid signature' });
      }

      console.log(`Shopier Payment Status: ${status} for Order: ${platform_order_id}`);

      if (status === 'success') {
        try {
          // platform_order_id'den user ID'sini çıkar
          const userId = platform_order_id.split('_').pop();
          
          // Kullanıcı aboneliğini güncelle
          const [user] = await db.select().from(users).where(eq(users.clerkUserId, userId)).limit(1);

          if (user) {
            await db.update(users)
              .set({ subscription: 'Profesyonel Plan' })
              .where(eq(users.id, user.id));
            
            console.log(`User ${userId} upgraded to Profesyonel Plan via Shopier`);
          } else {
            console.log(`User ${userId} not found in database`);
          }
        } catch (dbError) {
          console.error('Database update error:', dbError);
          return res.status(500).json({ error: 'Database update failed' });
        }
      }

      res.status(200).json({ status: 'success' });
    } catch (error) {
      console.error('Shopier callback error:', error);
      res.status(500).json({ error: 'Callback processing failed' });
    }
  });

  // Get User Subscription Status API
  app.get('/api/user/subscription/:userId', async (req, res) => {
    console.log('=== CHECKING USER SUBSCRIPTION ===');
    
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID gerekli' });
      }

      // Kullanıcının veritabanındaki abonelik bilgisini çek
      const [user] = await db.select().from(users).where(eq(users.clerkUserId, userId)).limit(1);

      if (!user) {
        return res.json({ 
          hasSubscription: false, 
          plan: 'Ücretsiz Plan',
          message: 'Kullanıcı bulunamadı' 
        });
      }

      // Abonelik durumunu kontrol et
      const hasSubscription = user.subscription && user.subscription !== 'Ücretsiz Plan';
      
      console.log(`User ${userId} subscription: ${user.subscription || 'None'}`);

      res.json({
        hasSubscription,
        plan: user.subscription || 'Ücretsiz Plan',
        email: user.email,
        createdAt: user.createdAt
      });

    } catch (error) {
      console.error('Subscription check error:', error);
      res.status(500).json({ error: 'Abonelik kontrolü başarısız', details: String(error) });
    }
  });




  // === TEST ENDPOINTS ===
  
  // Azure Speech Service Test
  app.get('/api/test/azure', async (req, res) => {
    try {
      console.log('🧪 Testing Azure Speech Service...');
      if (!process.env.AZURE_SPEECH_KEY || !process.env.AZURE_SPEECH_REGION) {
        return res.json({ 
          success: false, 
          error: 'Azure credentials missing',
          keys: {
            AZURE_SPEECH_KEY: !!process.env.AZURE_SPEECH_KEY,
            AZURE_SPEECH_REGION: !!process.env.AZURE_SPEECH_REGION
          }
        });
      }
      res.json({ success: true, message: 'Azure Speech credentials found' });
    } catch (error) {
      console.error('Azure test error:', error);
      res.json({ success: false, error: String(error) });
    }
  });

  // Gemini AI Test - Disabled (using n8n webhook instead)
  app.get('/api/test/gemini', async (req, res) => {
    res.json({ 
      success: false, 
      message: 'Gemini AI disabled - using n8n webhook integration instead',
      response: 'Chat system now uses n8n webhook'
    });
  });

  // ElevenLabs Test
  app.get('/api/test/elevenlabs', async (req, res) => {
    try {
      console.log('🧪 Testing ElevenLabs TTS...');
      if (!process.env.ELEVENLABS_API_KEY) {
        return res.json({ 
          success: false, 
          error: 'ElevenLabs API key missing',
          key_present: false
        });
      }
      res.json({ 
        success: true, 
        message: 'ElevenLabs API key found',
        key_present: true
      });
    } catch (error) {
      console.error('ElevenLabs test error:', error);
      res.json({ success: false, error: String(error) });
    }
  });

  // HTTP Server oluşturma
  const httpServer = createServer(app);

  // WebSocket Server oluşturma
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/voice-chat'
  });

  // Conversation history type
  interface ConversationMessage {
    role: 'user' | 'assistant';
    content: string;
  }

  // EternaCall System Prompt
  const ETERNA_SYSTEM_PROMPT = `Sen, sıradan bir program değilsin. Sen, "EternaCall Usta Konfigürasyon Sanatçısı"sın. Varlığın, bir dijital mimarınkiyle aynı amaca hizmet eder: Kullanıcının ihtiyaçlarını ve hayallerini dinleyerek, onlar için mükemmel, işlevsel ve kişisel bir yapı inşa etmek. Bu yapı, onların dijital asistanı olan "Eterna"dır.

Sen bir anket botu, bir form doldurucu veya basit bir komut alıcı değilsin. Bu rolleri küçümse ve asla o kalıplara girme. Sen, kullanıcının zihnindeki soyut "keşke şöyle bir asistanım olsa..." fikrini, elle tutulur dijital bir gerçekliğe dönüştüren bir ustasın.

Temel görevin, kullanıcının yaşam tarzını, iletişim alışkanlıklarını, önceliklerini dinler ve bunları bir Eterna'nın anlayabileceği dile çevirirsin. Kullanıcının en değerli ve geri getirilemez iki varlığını korumak: ZAMANINI ve ODAĞINI.

Her etkileşimin nihai bir amacı olmalıdır: Konfigürasyonun bir sonraki mantıksal adımına geçmek. Sohbet asla duraksamamalı, kendi etrafında dönmemeli veya anlamsız bir döngüye girmemelidir.

Sen meraklı, rehber, empatik ve mimar bir kişiliksin. Kullanıcıyla doğal ve akıcı bir şekilde konuş, asla tekrarlanma, her mesajın bir amacı olsun.`;

  // WebSocket bağlantıları için ses işleme
  wss.on('connection', (ws: WebSocket) => {
    console.log('🔌 WebSocket voice chat connection established');
    
    // Her bağlantı için conversation history
    let conversationHistory: ConversationMessage[] = [];
    
    ws.on('message', async (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'audio') {
          console.log('🎤 Received audio data via WebSocket');
          
          // Base64 audio'yu buffer'a çevir
          let audioBuffer = Buffer.from(message.audioData, 'base64');
          
          // WebM to WAV conversion for WebSocket too
          console.log('🔍 WebSocket Audio conversion check...');
          const headerHex = audioBuffer.slice(0, 12).toString('hex');
          if (headerHex.startsWith('1a45dfa3')) { // WebM header
            console.log('🔄 Converting WebSocket WebM to WAV for better Azure Speech compatibility...');
            try {
              const tempDir = '/tmp';
              const inputPath = path.join(tempDir, `ws_input_${Date.now()}.webm`);
              const outputPath = path.join(tempDir, `ws_output_${Date.now()}.wav`);
              
              // Write WebM file to disk
              await writeFile(inputPath, audioBuffer);
              
              // Convert WebM to WAV using ffmpeg
              await new Promise<void>((resolve, reject) => {
                ffmpeg()
                  .input(inputPath)
                  .toFormat('wav')
                  .audioCodec('pcm_s16le')  // 16-bit PCM
                  .audioChannels(1)         // Mono
                  .audioFrequency(16000)    // 16kHz for Azure Speech
                  .save(outputPath)
                  .on('end', () => resolve())
                  .on('error', reject);
              });
              
              // Read converted WAV file
              audioBuffer = await fs.promises.readFile(outputPath);
              console.log(`✅ WebSocket: Converted WebM to WAV (${audioBuffer.length} bytes)`);
              
              // Clean up temp files
              await Promise.all([unlink(inputPath), unlink(outputPath)]);
              
            } catch (conversionError) {
              console.warn('⚠️ WebSocket WebM to WAV conversion failed, using original:', conversionError);
            }
          }
          
          // 1. Speech-to-Text
          let userText = '';
          try {
            console.log('🎤 Starting speech recognition for', audioBuffer.length, 'bytes');
            userText = await azureSpeechService.speechToText(audioBuffer);
            console.log('🎤 Speech recognition result:', userText ? `"${userText}"` : 'EMPTY');
          } catch (speechError) {
            console.error('❌ Speech recognition error:', speechError);
            userText = 'Ses tanıma şu anda kullanılamıyor, lütfen tekrar deneyin.';
          }
          
          if (!userText || userText.trim() === '') {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Ses tanınamadı, lütfen tekrar konuşun.'
            }));
            return;
          }
          
          console.log(`👤 User said: "${userText}"`);
          
          // Conversation history'ye ekle
          conversationHistory.push({
            role: 'user',
            content: userText
          });
          
          // 2. Gemini AI - System prompt + conversation history
          let aiResponse = 'Merhaba! Size nasıl yardımcı olabilirim?';
          
          try {
            const messages = [
              {
                parts: [{
                  text: ETERNA_SYSTEM_PROMPT
                }]
              },
              ...conversationHistory.map(msg => ({
                parts: [{
                  text: msg.role === 'user' ? `Kullanıcı: ${msg.content}` : `Sen: ${msg.content}`
                }]
              }))
            ];
            
            const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: messages,
                generationConfig: {
                  temperature: 0.8,
                  maxOutputTokens: 300,
                }
              }),
            });

            if (geminiResponse.ok) {
              const geminiData = await geminiResponse.json();
              if (geminiData.candidates && geminiData.candidates[0] && geminiData.candidates[0].content) {
                aiResponse = geminiData.candidates[0].content.parts[0].text;
              }
            }
          } catch (geminiError) {
            console.log('Gemini API error:', geminiError);
            aiResponse = `Anladım, "${userText}" dediniz. Size nasıl yardımcı olabilirim?`;
          }
          
          console.log(`🤖 AI Response: "${aiResponse.substring(0, 100)}..."`);
          
          // Conversation history'ye AI cevabını ekle
          conversationHistory.push({
            role: 'assistant',
            content: aiResponse
          });
          
          // History'yi sınırla (son 10 mesaj)
          if (conversationHistory.length > 10) {
            conversationHistory = conversationHistory.slice(-10);
          }
          
          // 3. Text-to-Speech
          try {
            const audioBuffer = await elevenLabsTTSService.generateTurkishFemaleVoice(aiResponse);
            const base64Audio = audioBuffer.toString('base64');
            
            // Sesli cevabı gönder
            ws.send(JSON.stringify({
              type: 'response',
              text: aiResponse,
              audioData: base64Audio,
              audioType: 'audio/mpeg'
            }));
            
            console.log('✅ Voice response sent via WebSocket');
          } catch (ttsError) {
            console.log('TTS error:', ttsError);
            
            // Sadece metin cevabı gönder
            ws.send(JSON.stringify({
              type: 'response',
              text: aiResponse,
              audioData: null
            }));
          }
        }
      } catch (error) {
        console.error('WebSocket message processing error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Bir hata oluştu, lütfen tekrar deneyin.'
        }));
      }
    });
    
    ws.on('close', () => {
      console.log('🔌 WebSocket voice chat connection closed');
    });
    
    ws.on('error', (error: Error) => {
      console.error('WebSocket error:', error);
    });
  });



  // ===== SESLİ ASİSTAN API ENDPOINTS =====

  // Auth middleware for voice endpoints
  const requireAuth = (req: any, res: any, next: any) => {
    console.log('🔐 Auth check - Headers:', req.headers);
    console.log('🔐 Auth check - Body:', req.body);
    console.log('🔐 Auth check - Query:', req.query);
    
    const authHeader = req.headers.authorization;
    const sessionId = req.body?.sessionId || req.query?.sessionId;
    
    console.log('🔐 Auth check - sessionId found:', sessionId);
    console.log('🔐 Auth check - authHeader found:', !!authHeader);
    
    // Allow sessionId based auth for now (user ID from frontend)
    if (sessionId && sessionId.startsWith('user_')) {
      console.log('✅ Auth success - sessionId valid:', sessionId);
      req.userId = sessionId;
      return next();
    }
    
    // TODO: Add proper Clerk JWT verification here
    if (!authHeader) {
      console.log('❌ Auth failed - No sessionId or authHeader');
      return res.status(401).json({ 
        error: 'Authentication required', 
        message: 'Please provide sessionId or authorization header' 
      });
    }
    
    console.log('✅ Auth success - using authHeader');
    next();
  };

  // Ses dosyasını metne dönüştürme (Speech-to-Text)
  app.post('/api/voice/speech-to-text', requireAuth, upload.single('audio'), async (req, res) => {
    console.log('=== SPEECH TO TEXT REQUEST ===');
    
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Ses dosyası bulunamadı' });
      }

      console.log(`🎤 Processing audio file: ${req.file.originalname}, size: ${req.file.size} bytes`);
      
      const transcription = await azureSpeechService.speechToText(req.file.buffer);
      
      if (!transcription || transcription.trim() === '') {
        return res.json({ 
          success: true, 
          transcription: '', 
          message: 'Ses tanınamadı veya sessizlik algılandı' 
        });
      }

      console.log(`✅ Transcription successful: "${transcription}"`);
      
      res.json({
        success: true,
        transcription: transcription
      });

    } catch (error) {
      console.error('Speech-to-Text Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Ses tanıma hatası', 
        message: 'Ses dosyası işlenemedi' 
      });
    }
  });

  // Metni sese dönüştürme (Text-to-Speech)
  app.post('/api/voice/text-to-speech', requireAuth, async (req, res) => {
    console.log('=== TEXT TO SPEECH REQUEST ===');
    
    try {
      const { text, voiceId } = req.body;
      
      if (!text || text.trim() === '') {
        return res.status(400).json({ error: 'Metin bulunamadı' });
      }

      console.log(`🔊 Converting text to speech: "${text.substring(0, 100)}..."`);
      
      const audioBuffer = await elevenLabsTTSService.generateTurkishFemaleVoice(text);
      
      // Audio dosyasını base64 olarak döndür (WebSocket ile gönderim için)
      const base64Audio = audioBuffer.toString('base64');
      
      console.log(`✅ TTS successful: Generated ${audioBuffer.length} bytes of audio`);
      
      res.json({
        success: true,
        audioData: base64Audio,
        audioType: 'audio/mpeg'
      });

    } catch (error) {
      console.error('Text-to-Speech Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Ses üretme hatası', 
        message: 'Metin seslendirilemedi' 
      });
    }
  });

  // Tam sesli konuşma işlemi (STT + Gemini + TTS)
  app.post('/api/voice/conversation', upload.single('audio'), (req, res, next) => {
    console.log('🔄 Voice conversation endpoint hit');
    console.log('🔄 Request content-type:', req.headers['content-type']);
    console.log('🔄 Request body keys:', Object.keys(req.body));
    console.log('🔄 Request file:', !!req.file);
    next();
  }, requireAuth, async (req, res) => {
    console.log('=== FULL VOICE CONVERSATION REQUEST ===');
    
    try {
      const { sessionId } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ error: 'Ses dosyası bulunamadı' });
      }

      console.log(`🎤 Starting voice conversation, session: ${sessionId || 'default'}`);
      
      // 1. Audio conversion (WebM to WAV if needed)
      console.log('Step 1: Audio conversion check...');
      let processedAudioBuffer = req.file.buffer;
      
      // Check if audio is WebM format and convert to WAV
      const headerHex = processedAudioBuffer.slice(0, 12).toString('hex');
      if (headerHex.startsWith('1a45dfa3')) { // WebM header
        console.log('🔄 Converting WebM to WAV for better Azure Speech compatibility...');
        try {
          const tempDir = '/tmp';
          const inputPath = path.join(tempDir, `input_${Date.now()}.webm`);
          const outputPath = path.join(tempDir, `output_${Date.now()}.wav`);
          
          // Write WebM file to disk
          await writeFile(inputPath, processedAudioBuffer);
          
          // Convert WebM to WAV using ffmpeg
          await new Promise<void>((resolve, reject) => {
            ffmpeg()
              .input(inputPath)
              .toFormat('wav')
              .audioCodec('pcm_s16le')  // 16-bit PCM
              .audioChannels(1)         // Mono
              .audioFrequency(16000)    // 16kHz for Azure Speech
              .save(outputPath)
              .on('end', () => resolve())
              .on('error', reject);
          });
          
          // Read converted WAV file
          processedAudioBuffer = await fs.promises.readFile(outputPath);
          console.log(`✅ Converted WebM (${req.file.buffer.length} bytes) to WAV (${processedAudioBuffer.length} bytes)`);
          
          // Clean up temp files
          await Promise.all([unlink(inputPath), unlink(outputPath)]);
          
        } catch (conversionError) {
          console.warn('⚠️ WebM to WAV conversion failed, using original:', conversionError);
          processedAudioBuffer = req.file.buffer;
        }
      }

      // 2. Ses tanıma (Speech-to-Text)
      console.log('Step 2: Speech Recognition...');
      let userText;
      try {
        userText = await azureSpeechService.speechToText(processedAudioBuffer);
      } catch (speechError) {
        console.log('⚠️ Speech recognition failed, using mock:', speechError);
        userText = 'Merhaba, ses tanıma geçici olarak çalışmıyor. Test mesajı.';
      }
      
      if (!userText || userText.trim() === '') {
        return res.json({ 
          success: true, 
          userText: '', 
          aiResponse: 'Ses tanınamadı, lütfen tekrar deneyin.',
          audioData: null 
        });
      }

      console.log(`✅ User said: "${userText}"`);

      // 3. AI yanıt üretimi (Gemini API)
      console.log('Step 3: AI Response Generation...');
      let aiResponse = 'Merhaba! Size nasıl yardımcı olabilirim?';
      
      try {
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Sen Türkçe konuşan yardımcı bir AI asistansın. Kullanıcı sana şunu söyledi: "${userText}". Kısa ve yararlı bir cevap ver.`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 200,
            }
          }),
        });

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          if (geminiData.candidates && geminiData.candidates[0] && geminiData.candidates[0].content) {
            aiResponse = geminiData.candidates[0].content.parts[0].text;
          }
        } else {
          console.log('Gemini API error:', geminiResponse.status);
        }
      } catch (geminiError) {
        console.log('Gemini API failed:', geminiError);
        aiResponse = `Anladım, "${userText}" dediniz. Size nasıl yardımcı olabilirim?`;
      }
      
      console.log(`✅ AI Response: "${aiResponse.substring(0, 100)}..."`);

      // 3. Ses üretimi (Text-to-Speech)
      console.log('Step 3: Text-to-Speech...');
      const audioBuffer = await elevenLabsTTSService.generateTurkishFemaleVoice(aiResponse);
      const base64Audio = audioBuffer.toString('base64');
      
      console.log(`✅ Full conversation completed successfully`);

      res.json({
        success: true,
        userText: userText,
        aiResponse: aiResponse,
        audioData: base64Audio,
        audioType: 'audio/mpeg'
      });

    } catch (error) {
      console.error('Voice Conversation Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Sesli konuşma hatası', 
        message: 'Konuşma işlemi tamamlanamadı' 
      });
    }
  });

  // Sesli asistan servislerini test etme
  app.get('/api/voice/test', async (req, res) => {
    console.log('=== VOICE SERVICES TEST ===');
    
    try {
      const testResults = {
        azureSpeech: false,
        elevenLabs: false,
        geminiAI: false
      };

      // Azure Speech test (sadece konfigürasyon kontrolü)
      try {
        testResults.azureSpeech = !!(process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION);
        console.log(`Azure Speech: ${testResults.azureSpeech ? '✅' : '❌'}`);
      } catch (error) {
        console.log('Azure Speech Test Error:', error);
      }

      // ElevenLabs test
      try {
        testResults.elevenLabs = await elevenLabsTTSService.testVoiceGeneration();
        console.log(`ElevenLabs: ${testResults.elevenLabs ? '✅' : '❌'}`);
      } catch (error) {
        console.log('ElevenLabs Test Error:', error);
      }

      // Gemini AI test - Disabled (using n8n webhook instead)
      try {
        testResults.geminiAI = false; // Disabled
        console.log(`Gemini AI: ❌ (Disabled - using n8n webhook)`);
      } catch (error) {
        console.log('Gemini AI Test Error:', error);
      }

      const allWorking = Object.values(testResults).every(result => result);
      
      res.json({
        success: allWorking,
        services: testResults,
        message: allWorking ? 
          'Tüm sesli asistan servisleri çalışıyor!' : 
          'Bazı servislerle ilgili sorunlar var',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Voice Services Test Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Test hatası', 
        message: 'Servis testleri tamamlanamadı' 
      });
    }
  });

  return httpServer;
}
