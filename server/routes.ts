import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { Webhook } from 'svix';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import Twilio from 'twilio';
import { textToSpeech } from './azure';

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const prisma = new PrismaClient();

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
        await prisma.user.create({
          data: {
            clerkUserId: id,
            email: email_addresses[0]?.email_address || '',
          }
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
    const API_KEY = 'WK9A0E8-N2C435K-PC4PQA7-ZJ2E7CH';
    
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
    
    const API_KEY = 'WK9A0E8-N2C435K-PC4PQA7-ZJ2E7CH';
    
    console.log('Using NOWPayments API Key from user');

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
          const user = await prisma.user.findFirst({
            where: {
              clerkUserId: order_id
            }
          });

          if (user) {
            // Update user subscription to Professional Plan
            await prisma.user.update({
              where: {
                id: user.id
              },
              data: {
                subscription: 'Profesyonel Plan'
              } as any
            });

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
    
    const API_KEY = '7311fcb8508b668d72df3f1fd22c0451';
    const API_SECRET = 'abc8145ed90f69218c7402a70cf490d0';
    
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
    
    const API_SECRET = 'abc8145ed90f69218c7402a70cf490d0';
    
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
          const user = await prisma.user.findFirst({
            where: { clerkUserId: userId }
          });

          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: { subscription: 'Profesyonel Plan' } as any
            });
            
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
      const user = await prisma.user.findFirst({
        where: { clerkUserId: userId }
      });

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

  // Twilio Voice API endpoint
  app.post('/api/voice', async (req, res) => {
    try {
      // Gelen isteğin içeriğini alıyoruz (Twilio'dan)
      const speechResult = req.body.SpeechResult as string | null; // Kullanıcının konuşması (varsa)

      // TwiML (Twilio Markup Language) yanıtı oluşturuyoruz
      const twiml = new Twilio.twiml.VoiceResponse();

      if (speechResult) {
        // ŞİMDİLİK BU KISMI BOŞ BIRAKIYORUZ
        // TODO: Kullanıcının konuşmasını Anthropic'e gönderip cevap alacağız
        twiml.say('Cevabınız işleniyor.'); 
      } else {
        // Bu, çağrının ilk anıdır. Karşılama mesajı oynatacağız.
        const welcomeMessage = "Merhaba, EternaCall hizmetine hoş geldiniz. Size nasıl yardımcı olabilirim?";
        
        try {
          // Mesajı Azure'da sese çeviriyoruz
          const audioBuffer = await textToSpeech(welcomeMessage);
          const audioBase64 = audioBuffer.toString('base64');
          
          // Sesi TwiML yanıtına ekliyoruz
          twiml.play({}, `data:audio/wav;base64,${audioBase64}`);

        } catch (error) {
          console.error("Error generating speech:", error);
          twiml.say("Üzgünüm, bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
        }
      }

      // TODO: Kullanıcının cevabını dinlemek için TwiML'e <Gather> ekleyeceğiz

      // TwiML yanıtını XML formatında geri döndürüyoruz
      res.set('Content-Type', 'text/xml');
      res.send(twiml.toString());
      
    } catch (error) {
      console.error('Twilio voice endpoint error:', error);
      res.status(500).json({ error: 'Voice processing failed' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
