import * as speechSdk from 'microsoft-cognitiveservices-speech-sdk';

// Azure Speech Service konfigürasyonu
export class AzureSpeechService {
  private speechConfig: speechSdk.SpeechConfig | null;
  private speechKey: string;
  private speechRegion: string;
  private isEnabled: boolean;

  constructor() {
    const speechKey = process.env.AZURE_SPEECH_KEY;
    const speechRegion = process.env.AZURE_SPEECH_REGION;

    if (!speechKey || !speechRegion) {
      console.warn('Azure Speech credentials not found in environment variables. Service will be disabled.');
      this.isEnabled = false;
      this.speechConfig = null;
      this.speechKey = '';
      this.speechRegion = '';
      return;
    }

    this.speechKey = speechKey;
    this.speechRegion = speechRegion;
    this.isEnabled = true;

    this.speechConfig = speechSdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
    this.speechConfig.speechRecognitionLanguage = 'tr-TR'; // Türkçe dil ayarı
    this.speechConfig.outputFormat = speechSdk.OutputFormat.Detailed;
  }

  // REST API ile ses dosyasını metne dönüştürme (WebM/Opus desteği)
  async speechToTextREST(audioBuffer: Buffer, contentType: string = 'audio/webm; codecs=opus'): Promise<string> {
    if (!this.isEnabled) {
      throw new Error('Azure Speech service is not available. API credentials not configured.');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const endpoint = `https://${this.speechRegion}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`;
      
      const url = new URL(endpoint);
      url.searchParams.set('language', 'tr-TR');
      url.searchParams.set('format', 'detailed');

      console.log(`🎤 Azure Speech REST: Processing ${audioBuffer.length} bytes of ${contentType}`);

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.speechKey,
          'Content-Type': contentType,
          'Accept': 'application/json',
        },
        body: audioBuffer,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure Speech REST API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      
      if (result.RecognitionStatus === 'Success') {
        // Robust parsing - check both DisplayText and NBest[0].Display
        let recognizedText = '';
        
        if (result.DisplayText) {
          recognizedText = result.DisplayText;
        } else if (result.NBest && result.NBest.length > 0 && result.NBest[0].Display) {
          recognizedText = result.NBest[0].Display;
        } else if (result.NBest && result.NBest.length > 0 && result.NBest[0].Lexical) {
          recognizedText = result.NBest[0].Lexical;
        }
        
        if (recognizedText) {
          console.log(`✅ Azure Speech Recognition: "${recognizedText}"`);
          return recognizedText;
        } else {
          console.warn('Azure Speech: Success status but no text found in result:', result);
          return '';
        }
      } else if (result.RecognitionStatus === 'NoMatch') {
        console.log('Azure Speech: No speech could be recognized.');
        return '';
      } else {
        console.error('Azure Speech Result:', result);
        throw new Error(`Speech recognition failed: ${result.RecognitionStatus}`);
      }

    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Speech recognition timeout (30 seconds)');
      }
      console.error('Azure Speech REST Error:', error);
      throw error;
    }
  }

  // Ses dosyasını metne dönüştürme (gerçek API)
  async speechToText(audioBuffer: Buffer): Promise<string> {
    if (!this.isEnabled) {
      throw new Error('Azure Speech service is not available. API credentials not configured.');
    }

    // Farklı formatları dene
    const formats = [
      'audio/ogg; codecs=opus',
      'audio/webm; codecs=opus', 
      'audio/wav'
    ];

    for (const format of formats) {
      try {
        console.log(`🎤 Trying Azure Speech with format: ${format}`);
        const result = await this.speechToTextREST(audioBuffer, format);
        if (result) {
          return result;
        }
      } catch (error) {
        console.warn(`Format ${format} failed:`, error);
        continue;
      }
    }

    // Hiçbir format çalışmazsa SDK'yı dene
    try {
      // SDK fallback (PCM formatları için)
      console.log('⚠️ All REST formats failed, trying SDK fallback...');
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Speech recognition timeout (30 seconds)'));
        }, 30000);

        try {
          // Audio buffer'ı Azure Speech SDK formatına dönüştür
          const pushStream = speechSdk.AudioInputStream.createPushStream();
          pushStream.write(audioBuffer);
          pushStream.close();

          const audioConfig = speechSdk.AudioConfig.fromStreamInput(pushStream);
          const recognizer = new speechSdk.SpeechRecognizer(this.speechConfig!, audioConfig);

          recognizer.recognizeOnceAsync(
            (result: speechSdk.SpeechRecognitionResult) => {
              clearTimeout(timeout);
              recognizer.close();

              if (result.reason === speechSdk.ResultReason.RecognizedSpeech) {
                console.log(`🎤 Azure Speech SDK Recognition: "${result.text}"`);
                resolve(result.text);
              } else if (result.reason === speechSdk.ResultReason.NoMatch) {
                console.log('Azure Speech SDK: No speech could be recognized.');
                resolve('');
              } else {
                console.error('Azure Speech SDK Error:', result.errorDetails);
                reject(new Error(`Speech recognition failed: ${result.errorDetails}`));
              }
            },
            (error: string) => {
              clearTimeout(timeout);
              recognizer.close();
              console.error('Azure Speech SDK Recognition Error:', error);
              reject(new Error(`Speech recognition error: ${error}`));
            }
          );
        } catch (error) {
          clearTimeout(timeout);
          console.error('Azure Speech SDK Service Error:', error);
          reject(error);
        }
      });
    } catch (sdkError) {
      console.error('Azure Speech SDK Error:', sdkError);
      throw new Error('Speech recognition failed with all methods');
    }
  }

  // Gerçek zamanlı konuşma tanıma için WebSocket desteği
  createContinuousRecognizer(onResult: (text: string) => void, onError: (error: string) => void) {
    if (!this.isEnabled) {
      throw new Error('Azure Speech service is not available. API credentials not configured.');
    }

    const audioConfig = speechSdk.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new speechSdk.SpeechRecognizer(this.speechConfig!, audioConfig);

    recognizer.recognized = (s, e) => {
      if (e.result.reason === speechSdk.ResultReason.RecognizedSpeech) {
        console.log(`🎤 Continuous Recognition: "${e.result.text}"`);
        onResult(e.result.text);
      }
    };

    recognizer.recognizing = (s, e) => {
      console.log(`🎤 Recognizing: ${e.result.text}`);
      // Ara sonuçlar için kullanılabilir
    };

    recognizer.canceled = (s, e) => {
      console.log(`Recognition canceled: ${e.reason}`);
      if (e.reason === speechSdk.CancellationReason.Error) {
        console.error(`Azure Speech Error: ${e.errorDetails}`);
        onError(e.errorDetails || 'Unknown recognition error');
      }
      recognizer.stopContinuousRecognitionAsync();
    };

    return recognizer;
  }
}

// Singleton instance
export const azureSpeechService = new AzureSpeechService();