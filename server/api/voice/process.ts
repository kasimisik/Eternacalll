import { Request, Response } from 'express';
import multer from 'multer';
import { elevenLabsService } from '../../lib/elevenlabs';

// Configure multer for handling audio uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

// Speech-to-Text function (mock for now - can be replaced with OpenAI Whisper or other services)
async function speechToText(audioBuffer: Buffer): Promise<string> {
  // For now, return a mock response
  // TODO: Implement actual speech-to-text service (OpenAI Whisper, Google Speech-to-Text, etc.)
  
  console.log('🎤 Processing speech-to-text for audio buffer of size:', audioBuffer.length);
  
  // Mock responses based on different scenarios
  const mockResponses = [
    "Merhaba, nasılsın?",
    "Bugün hava nasıl?",
    "Bana yardım edebilir misin?",
    "Teşekkür ederim.",
    "Görüşürüz!"
  ];
  
  // Return a random mock response
  return mockResponses[Math.floor(Math.random() * mockResponses.length)];
}

// Generate AI response based on user text
function generateAIResponse(userText: string): string {
  // Simple AI responses for demo - this should be replaced with actual AI service
  const responses: { [key: string]: string } = {
    "merhaba": "Merhaba! Size nasıl yardımcı olabilirim?",
    "nasılsın": "Ben bir AI asistanıyım, her zaman iyiyim! Siz nasılsınız?",
    "hava": "Hava durumu hakkında güncel bilgi veremem, ancak size başka konularda yardımcı olabilirim.",
    "yardım": "Tabii ki size yardımcı olabilirim! Ne yapmak istiyorsunuz?",
    "teşekkür": "Rica ederim! Size yardımcı olabildiğim için mutluyum.",
    "görüşürüz": "Görüşmek üzere! Tekrar geldiğinizde burada olacağım.",
  };
  
  // Find response based on keywords
  const lowerText = userText.toLowerCase();
  for (const [keyword, response] of Object.entries(responses)) {
    if (lowerText.includes(keyword)) {
      return response;
    }
  }
  
  // Default response
  return "Anladım. Size nasıl yardımcı olabilirim? Daha spesifik bir soru sorabilirsiniz.";
}

// Text-to-Speech function using ElevenLabs
async function textToSpeech(text: string): Promise<Buffer> {
  try {
    // Use ElevenLabs API for text-to-speech
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.7,
          similarity_boost: 0.8,
          style: 0,
          use_speaker_boost: true
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Error in text-to-speech:', error);
    
    // Return a mock audio buffer if ElevenLabs fails
    // In a real implementation, you might want to use a fallback TTS service
    return Buffer.alloc(1024);
  }
}

export const processVoiceMiddleware = upload.single('audio');

export async function processVoice(req: Request, res: Response) {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    console.log('🎤 Processing voice input for user:', userId);
    console.log('📁 Audio file info:', {
      mimetype: req.file.mimetype,
      size: req.file.size,
      originalname: req.file.originalname
    });

    // Step 1: Convert speech to text
    const userText = await speechToText(req.file.buffer);
    console.log('💬 User said:', userText);

    // Step 2: Generate AI response
    const aiResponse = generateAIResponse(userText);
    console.log('🤖 AI response:', aiResponse);

    // Step 3: Convert AI response to speech
    const audioBuffer = await textToSpeech(aiResponse);
    console.log('🔊 Generated audio buffer size:', audioBuffer.length);

    // Step 4: Return audio response
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    
    res.send(audioBuffer);

  } catch (error) {
    console.error('Error processing voice:', error);
    res.status(500).json({ 
      error: 'Failed to process voice input',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}