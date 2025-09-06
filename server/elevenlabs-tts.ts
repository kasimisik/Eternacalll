interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
}

interface ElevenLabsTTSSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

export class ElevenLabsTTSService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';
  private isEnabled: boolean;
  
  // Türkçe kadın sesi için voice ID
  private turkishFemaleVoiceId = 'xyqF3vGMQlPk3e7yA4DI';

  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY || '';
    if (!this.apiKey) {
      console.warn('ElevenLabs API key not found in environment variables. Service will be disabled.');
      this.isEnabled = false;
      return;
    }
    this.isEnabled = true;
  }

  // Mevcut sesleri listele
  async getAvailableVoices(): Promise<ElevenLabsVoice[]> {
    if (!this.isEnabled) {
      throw new Error('ElevenLabs service is not available. API credentials not configured.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        method: 'GET',
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('ElevenLabs Voices Error:', error);
      throw error;
    }
  }

  // Metni sese dönüştürme (timeout destekli)
  async textToSpeech(
    text: string, 
    voiceId?: string,
    settings?: Partial<ElevenLabsTTSSettings>
  ): Promise<Buffer> {
    if (!this.isEnabled) {
      throw new Error('ElevenLabs service is not available. API credentials not configured.');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000); // 45s timeout for TTS

    try {
      // Text length validation
      if (text.length > 2000) {
        throw new Error('Text too long (max 2000 characters)');
      }

      const selectedVoiceId = voiceId || this.turkishFemaleVoiceId;
      
      const defaultSettings: ElevenLabsTTSSettings = {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true,
      };

      const ttsSettings = { ...defaultSettings, ...settings };

      console.log(`🔊 ElevenLabs TTS: Converting "${text.substring(0, 50)}..." to speech`);

      const response = await fetch(`${this.baseUrl}/text-to-speech/${selectedVoiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2', // Türkçe desteği için
          voice_settings: ttsSettings,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs TTS error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const audioBuffer = await response.arrayBuffer();
      console.log(`✅ ElevenLabs TTS: Generated ${audioBuffer.byteLength} bytes of audio`);
      
      return Buffer.from(audioBuffer);
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Text-to-speech timeout (45 seconds)');
      }
      console.error('ElevenLabs TTS Error:', error);
      throw error;
    }
  }

  // Türkçe kadın sesi için özel ayarlar
  async generateTurkishFemaleVoice(text: string): Promise<Buffer> {
    const optimizedSettings: ElevenLabsTTSSettings = {
      stability: 0.6,        // Biraz daha kararlı ses
      similarity_boost: 0.8, // Daha yüksek benzerlik
      style: 0.2,           // Hafif stil ekleme
      use_speaker_boost: true,
    };

    return this.textToSpeech(text, this.turkishFemaleVoiceId, optimizedSettings);
  }

  // Ses kalitesini kontrol etme
  async testVoiceGeneration(): Promise<boolean> {
    try {
      const testText = "Merhaba, ben sesli asistanınızım. Size nasıl yardımcı olabilirim?";
      const audioBuffer = await this.generateTurkishFemaleVoice(testText);
      return audioBuffer.length > 0;
    } catch (error) {
      console.error('ElevenLabs Test Error:', error);
      return false;
    }
  }
}

// Singleton instance
export const elevenLabsTTSService = new ElevenLabsTTSService();