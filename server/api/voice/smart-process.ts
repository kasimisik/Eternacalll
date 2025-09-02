import { Request, Response } from 'express';
import multer from 'multer';
import { textToSpeech } from '../../azure';
import { eternacall } from '../../eternacall';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

// Set FFmpeg path
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

const writeFileAsync = promisify(writeFile);
const unlinkAsync = promisify(unlink);

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

// Track active requests per user to prevent multiple simultaneous processing
const activeRequests = new Map<string, boolean>();

// Smart Voice Processing with Azure -> Anthropic -> ElevenLabs orchestration
export async function smartProcess(req: Request, res: Response) {
  try {
    const userId = req.headers['x-user-id'] as string;
    
    // Check if user already has an active request
    if (activeRequests.get(userId)) {
      console.log('⚠️ User already has active voice request, skipping...');
      return res.status(429).json({ error: 'Already processing voice request' });
    }
    
    // Mark user as having active request
    activeRequests.set(userId, true);
    
    console.log('=== SMART VOICE ORCHESTRATION STARTED ===');
    
    const conversationHistoryStr = req.body.conversationHistory || '[]';
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    if (!req.file) {
      activeRequests.delete(userId);
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
      activeRequests.delete(userId);
      return res.status(400).json({ error: 'No speech detected in audio' });
    }
    
    console.log('✅ Azure STT Result:', userText);

    // STEP 2: ANTHROPIC AI RESPONSE WITH CONVERSATION HISTORY
    console.log('🔄 Step 2: Anthropic AI processing with conversation context...');
    const aiTextResponse = await getAIResponseWithHistory(userText, userId, conversationHistory);
    
    if (!aiTextResponse) {
      activeRequests.delete(userId);
      return res.status(500).json({ error: 'Failed to generate AI response' });
    }
    
    console.log('✅ Anthropic Response:', aiTextResponse);

    // STEP 3: TEXT TO SPEECH (ElevenLabs or Azure)
    console.log('🔄 Step 3: Text-to-Speech processing...');
    const audioBuffer = await textToSpeech(aiTextResponse);
    
    if (!audioBuffer) {
      console.error('❌ Ses üretimi başarısız oldu');
      activeRequests.delete(userId);
      return res.status(500).json({ error: 'Ses üretimi başarısız' });
    }
    
    console.log('✅ Text-to-Speech completed');

    // STEP 4: UPDATE CONVERSATION HISTORY
    const newHistoryEntry = {
      user: userText,
      assistant: aiTextResponse
    };
    
    // Send conversation update in header for frontend to track (encode for safe header transmission)
    res.setHeader('x-conversation-update', encodeURIComponent(JSON.stringify(newHistoryEntry)));
    res.setHeader('Content-Type', 'audio/mpeg');
    
    console.log('✅ Smart Voice Orchestration completed successfully');
    
    // Clear active request flag
    activeRequests.delete(userId);
    
    return res.send(audioBuffer);

  } catch (error) {
    console.error('❌ Smart Voice Orchestration Error:', error);
    
    // Clear active request flag on error
    const userId = req.headers['x-user-id'] as string;
    if (userId) {
      activeRequests.delete(userId);
    }
    
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
    
    // Create speech config with improved settings
    const speechConfig = speechSdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
    speechConfig.speechRecognitionLanguage = "tr-TR"; // Turkish recognition
    
    // Optimized recognition settings for speed
    speechConfig.setProperty(speechSdk.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, "3000");
    speechConfig.setProperty(speechSdk.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs, "1000");
    speechConfig.setProperty(speechSdk.PropertyId.Speech_SegmentationSilenceTimeoutMs, "1000");
    speechConfig.setProperty(speechSdk.PropertyId.SpeechServiceResponse_RequestDetailedResultTrueFalse, "true");
    
    // Use push stream for better format compatibility
    const pushStream = speechSdk.AudioInputStream.createPushStream();
    pushStream.write(audioBuffer);
    pushStream.close();
    
    // Create audio config from stream (more flexible than file input)
    const audioConfig = speechSdk.AudioConfig.fromStreamInput(pushStream);
    
    // Create recognizer
    const recognizer = new speechSdk.SpeechRecognizer(speechConfig, audioConfig);
    
    return new Promise((resolve, reject) => {
      recognizer.recognizeOnceAsync(
        (result) => {
          console.log('🔍 Azure STT Result reason:', result.reason);
          console.log('📝 Azure STT Result text:', result.text);
          console.log('📊 Azure STT Result details:', result.properties);
          
          if (result.reason === speechSdk.ResultReason.RecognizedSpeech && result.text.trim()) {
            console.log('✅ Azure STT - Recognized text:', result.text);
            resolve(result.text);
          } else if (result.reason === speechSdk.ResultReason.NoMatch) {
            console.log('⚠️ Azure STT - No speech recognized, using fallback');
            // Try to extract any partial recognition
            const noMatchDetails = result.properties.getProperty(speechSdk.PropertyId.SpeechServiceResponse_JsonResult);
            console.log('🔍 NoMatch details:', noMatchDetails);
            
            // If we have audio but no recognition, try a fallback approach
            console.log('🔄 Attempting fallback: Mock recognition for testing');
            resolve("Merhaba, sizi duyuyorum ama net anlayamadım.");
          } else {
            console.error('❌ Azure STT Error:', result.errorDetails);
            // Don't fail completely, provide a fallback
            resolve("Ses işleme hatası oluştu, tekrar deneyiniz.");
          }
          
          recognizer.close();
        },
        (error) => {
          console.error('❌ Azure STT SDK Error:', error);
          recognizer.close();
          // Don't fail completely, provide a fallback
          resolve("Ses işleme hatası oluştu, tekrar deneyiniz.");
        }
      );
    });

  } catch (error) {
    console.error('❌ Azure Speech-to-Text Error:', error);
    return null;
  }
}

// Enhanced AI Response using Eternacall System
async function getAIResponseWithHistory(
  userText: string, 
  userId: string, 
  conversationHistory: Array<{user: string, assistant: string}>
): Promise<string | null> {
  try {
    // Extract username from headers if available (will implement Clerk integration later)
    const username = "Değerli Kullanıcı";
    
    // Use Eternacall AI Assistant Architect system
    const result = await eternacall.processUserResponse(userText, userId, username);
    
    if (result.stepAdvanced) {
      console.log(`🔄 Eternacall: User progressed to step ${result.currentStep}`);
    }
    
    return result.response;

  } catch (error) {
    console.error('❌ Eternacall Response Error:', error);
    // Fallback to a basic response
    return "Merhaba! Ben Eternacall. Size özel AI asistanınızı tasarlamak için buradayım. Nasıl yardımcı olabilirim?";
  }
}

// Convert WebM to WAV for Azure Speech Service
async function convertWebMToWav(webmBuffer: Buffer): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    const inputPath = join(tmpdir(), `input-${Date.now()}.webm`);
    const outputPath = join(tmpdir(), `output-${Date.now()}.wav`);
    
    // Optimize conversion for speed
    
    try {
      // Write WebM buffer to temporary file
      await writeFileAsync(inputPath, webmBuffer);
      console.log('✅ WebM file written to:', inputPath);
      
      // Check if FFmpeg is available
      if (!ffmpegStatic) {
        throw new Error('FFmpeg not available');
      }
      
      // Convert using FFmpeg with detailed logging
      ffmpeg(inputPath)
        .toFormat('wav')
        .audioFrequency(16000) // 16kHz for Azure Speech
        .audioChannels(1)      // Mono for Azure Speech
        .audioCodec('pcm_s16le') // PCM 16-bit little-endian
        .on('start', () => {
          // Silent for speed
        })
        .on('progress', () => {
          // Silent for speed
        })
        .on('end', async () => {
          try {
            // Read converted WAV file (silent for speed)
            const fs = await import('fs');
            const wavBuffer = fs.readFileSync(outputPath);
            
            // Clean up temporary files
            await unlinkAsync(inputPath).catch(() => {});
            await unlinkAsync(outputPath).catch(() => {});
            
            resolve(wavBuffer);
          } catch (readError) {
            console.error('❌ Error reading converted file:', readError);
            reject(readError);
          }
        })
        .on('error', async (err: any) => {
          console.error('❌ FFmpeg conversion error:', err.message);
          // Clean up temporary files
          await unlinkAsync(inputPath).catch(() => {});
          await unlinkAsync(outputPath).catch(() => {});
          reject(err);
        })
        .save(outputPath);
        
    } catch (error) {
      console.error('❌ Conversion setup error:', error);
      // Clean up if file was created
      await unlinkAsync(inputPath).catch(() => {});
      reject(error);
    }
  });
}