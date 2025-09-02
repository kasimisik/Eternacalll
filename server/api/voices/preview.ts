import { Request, Response } from 'express';
import { elevenLabsService } from '../../lib/elevenlabs';

export async function previewVoice(req: Request, res: Response) {
  try {
    const { voiceId, text, language } = req.body;

    if (!voiceId || !text) {
      return res.status(400).json({ error: 'Voice ID and text are required' });
    }

    // For now, use a simple mock response since ElevenLabs TTS is not implemented
    // TODO: Implement actual ElevenLabs TTS API call
    
    if (!process.env.ELEVENLABS_API_KEY) {
      // Return a mock audio response
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'no-cache');
      
      // Create a simple mock audio buffer (silent audio)
      const mockAudioBuffer = Buffer.alloc(1024);
      
      res.send(mockAudioBuffer);
      return;
    }

    // Use the ElevenLabs API to generate speech
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
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
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    
    // Set appropriate headers for audio response
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.byteLength);
    res.setHeader('Cache-Control', 'no-cache');
    
    // Send the audio buffer
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error('Error generating voice preview:', error);
    res.status(500).json({ 
      error: 'Failed to generate voice preview',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}