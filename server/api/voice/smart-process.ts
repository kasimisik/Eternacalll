import { Request, Response } from 'express';
import multer from 'multer';
import { textToSpeech } from '../../azure';
import { getAIResponse } from '../../anthropic';
// ElevenLabs will be handled by existing text-to-speech function
// import { generateVoice } from '../../lib/elevenlabs';

// Multer configuration for audio file handling
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

export const smartProcessMiddleware = upload.single('audio');

// Smart Voice Processing with Azure -> Anthropic -> ElevenLabs orchestration
export async function smartProcess(req: Request, res: Response) {
  try {
    console.log('=== SMART VOICE ORCHESTRATION STARTED ===');
    
    const userId = req.headers['x-user-id'] as string;
    const conversationHistoryStr = req.body.conversationHistory || '[]';
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Audio file required' });
    }

    let conversationHistory: Array<{user: string, assistant: string}> = [];
    try {
      conversationHistory = JSON.parse(conversationHistoryStr);
    } catch (e) {
      console.log('Conversation history parse error, starting fresh');
    }

    // STEP 1: AZURE SPEECH TO TEXT
    console.log('🔄 Step 1: Azure Speech-to-Text processing...');
    const userText = await azureSpeechToText(req.file.buffer);
    
    if (!userText || userText.trim() === '') {
      return res.status(400).json({ error: 'No speech detected in audio' });
    }
    
    console.log('✅ Azure STT Result:', userText);

    // STEP 2: ANTHROPIC AI RESPONSE WITH CONVERSATION HISTORY
    console.log('🔄 Step 2: Anthropic AI processing with conversation context...');
    const aiTextResponse = await getAIResponseWithHistory(userText, userId, conversationHistory);
    
    if (!aiTextResponse) {
      return res.status(500).json({ error: 'Failed to generate AI response' });
    }
    
    console.log('✅ Anthropic Response:', aiTextResponse);

    // STEP 3: TEXT TO SPEECH (ElevenLabs or Azure)
    console.log('🔄 Step 3: Text-to-Speech processing...');
    const audioBuffer = await textToSpeech(aiTextResponse);
    
    if (!audioBuffer) {
      return res.status(500).json({ error: 'Failed to generate speech' });
    }
    
    console.log('✅ Text-to-Speech completed');

    // STEP 4: UPDATE CONVERSATION HISTORY
    const newHistoryEntry = {
      user: userText,
      assistant: aiTextResponse
    };
    
    // Send conversation update in header for frontend to track
    res.setHeader('x-conversation-update', JSON.stringify(newHistoryEntry));
    res.setHeader('Content-Type', 'audio/mpeg');
    
    console.log('✅ Smart Voice Orchestration completed successfully');
    
    return res.send(audioBuffer);

  } catch (error) {
    console.error('❌ Smart Voice Orchestration Error:', error);
    return res.status(500).json({ 
      error: 'Voice processing failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

// Azure Speech-to-Text function
async function azureSpeechToText(audioBuffer: Buffer): Promise<string | null> {
  try {
    const speechKey = process.env.AZURE_SPEECH_KEY;
    const speechRegion = process.env.AZURE_SPEECH_REGION;
    
    if (!speechKey || !speechRegion) {
      console.error('❌ Azure Speech credentials not found');
      return null;
    }

    // Import Azure SDK
    const speechSdk = await import('microsoft-cognitiveservices-speech-sdk');
    
    // Create speech config
    const speechConfig = speechSdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
    speechConfig.speechRecognitionLanguage = "tr-TR"; // Turkish recognition
    
    // Create audio config from buffer
    const audioConfig = speechSdk.AudioConfig.fromWavFileInput(audioBuffer);
    
    // Create recognizer
    const recognizer = new speechSdk.SpeechRecognizer(speechConfig, audioConfig);
    
    return new Promise((resolve, reject) => {
      recognizer.recognizeOnceAsync(
        (result) => {
          if (result.reason === speechSdk.ResultReason.RecognizedSpeech) {
            console.log('✅ Azure STT - Recognized text:', result.text);
            resolve(result.text);
          } else if (result.reason === speechSdk.ResultReason.NoMatch) {
            console.log('⚠️ Azure STT - No speech recognized');
            resolve(null);
          } else {
            console.error('❌ Azure STT Error:', result.errorDetails);
            reject(new Error(`Speech recognition failed: ${result.errorDetails}`));
          }
          recognizer.close();
        },
        (error) => {
          console.error('❌ Azure STT SDK Error:', error);
          recognizer.close();
          reject(new Error(`Speech recognition error: ${error}`));
        }
      );
    });

  } catch (error) {
    console.error('❌ Azure Speech-to-Text Error:', error);
    return null;
  }
}

// Enhanced AI Response with Conversation History
async function getAIResponseWithHistory(
  userText: string, 
  userId: string, 
  conversationHistory: Array<{user: string, assistant: string}>
): Promise<string | null> {
  try {
    // Build conversation context
    let conversationContext = "";
    if (conversationHistory.length > 0) {
      conversationContext = "\n\nKonuşma Geçmişi:\n";
      conversationHistory.slice(-5).forEach((turn, index) => {
        conversationContext += `Kullanıcı ${index + 1}: ${turn.user}\n`;
        conversationContext += `Asistan ${index + 1}: ${turn.assistant}\n\n`;
      });
    }

    // Enhanced prompt for continuous conversation
    const enhancedPrompt = `Sen akıllı bir sesli asistansın ve kullanıcıyla gerçek zamanlı doğal bir konuşma yapıyorsun.

Konuşma Kuralları:
1. Kısa, net ve samimi yanıtlar ver (maximum 2-3 cümle)
2. Konuşma geçmişini dikkate alarak tutarlı ol
3. Soru sorarak konuşmayı devam ettir
4. Doğal bir sohbet havası yarat
5. Türkçe konuş ve günlük dil kullan

${conversationContext}

Kullanıcının Son Mesajı: "${userText}"

Asistan Yanıtın:`;

    // Use existing AI response function with enhanced prompt
    const response = await getAIResponse(enhancedPrompt, userId);
    
    return response;

  } catch (error) {
    console.error('❌ AI Response with History Error:', error);
    return null;
  }
}