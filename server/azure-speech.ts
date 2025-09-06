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
      url.searchParams.set('profanity', 'raw');

      console.log(`🎤 Azure Speech REST: Processing ${audioBuffer.length} bytes of ${contentType}`);
      
      // Debug: Ses dosyasının temel özelliklerini kontrol et
      if (audioBuffer.length < 500) {
        console.warn('⚠️ Audio buffer çok küçük, muhtemelen boş ses');
        return '';
      }
      
      if (audioBuffer.length > 1000000) {
        console.warn('⚠️ Audio buffer çok büyük, kısaltılması gerekebilir');
      }

      // Header debug for format detection
      const headerHex = audioBuffer.slice(0, 12).toString('hex');
      console.log(`🔍 Audio file header: ${headerHex}`);
      
      // Common audio format detection
      if (headerHex.startsWith('52494646')) {
        console.log('📄 Detected: WAV/RIFF format');
      } else if (headerHex.startsWith('1a45dfa3')) {
        console.log('📄 Detected: WebM format');
      } else if (headerHex.startsWith('4f676753')) {
        console.log('📄 Detected: OGG format');
      } else {
        console.log('📄 Unknown audio format, proceeding with specified content-type');
      }

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
        console.log('🔍 Azure Speech Full Result:', JSON.stringify(result, null, 2));
        
        // Robust parsing - check both DisplayText and NBest[0].Display
        let recognizedText = '';
        
        if (result.DisplayText && result.DisplayText.trim()) {
          recognizedText = result.DisplayText.trim();
          console.log('✅ Found text in DisplayText:', recognizedText);
        } else if (result.NBest && result.NBest.length > 0) {
          const bestResult = result.NBest[0];
          console.log('🔍 Checking NBest[0]:', JSON.stringify(bestResult, null, 2));
          
          if (bestResult.Display && bestResult.Display.trim()) {
            recognizedText = bestResult.Display.trim();
            console.log('✅ Found text in NBest Display:', recognizedText);
          } else if (bestResult.Lexical && bestResult.Lexical.trim()) {
            recognizedText = bestResult.Lexical.trim();
            console.log('✅ Found text in NBest Lexical:', recognizedText);
          } else if (bestResult.ITN && bestResult.ITN.trim()) {
            recognizedText = bestResult.ITN.trim();
            console.log('✅ Found text in NBest ITN:', recognizedText);
          }
        }
        
        if (recognizedText) {
          console.log(`✅ Azure Speech Recognition SUCCESS: "${recognizedText}"`);
          return recognizedText;
        } else {
          console.warn('⚠️ Azure Speech: Success status but NO TEXT found in result');
          console.log('Duration:', result.Duration, 'Offset:', result.Offset);
          
          // Eğer Duration > 0 ama metin yoksa ses çok sessiz olabilir
          if (result.Duration > 1000000) { // 1 saniyeden fazla
            console.log('🔍 Audio seems to have duration but no speech detected');
            console.log('💡 Possible issues: background noise, very quiet speech, wrong language');
          }
          
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

    // Farklı formatları dene - Azure Speech için optimized sıra
    const formats = [
      'audio/wav',                    // En uyumlu format
      'audio/wav; codec=pcm',         // PCM WAV
      'audio/x-wav',                  // Alternative WAV
      'audio/webm; codecs=pcm',       // PCM WebM  
      'audio/ogg; codecs=opus',       // Opus fallback
      'audio/webm; codecs=opus'       // Son çare
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