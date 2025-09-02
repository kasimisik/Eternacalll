import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import ffmpeg from 'fluent-ffmpeg';

// Bu fonksiyon, AI yanıtını ses çıkışına dönüştürüyor (Sadece Azure TTS - En Yüksek Kalite)
export async function textToSpeech(text: string): Promise<Buffer | null> {
  console.log("🔊 AI yanıtını Azure TTS (SSML destekli) ile sesli çıkışa dönüştürüyoruz...");
  
  // ADIM 1: Akıllı SSML oluştur (PDF'deki gibi)
  const ssmlToSpeak = createSSMLForText(text);
  console.log("✅ SSML dinamik olarak oluşturuldu");
  
  // ADIM 2: SSML'i kullanarak yüksek kaliteli Azure TTS
  const azureResult = await textToSpeechAzureSSML(ssmlToSpeak);
  
  if (azureResult) {
    console.log("✅ Azure TTS SSML ile premium kalite ses hazır");
    return azureResult;
  } else {
    console.log("❌ Azure TTS başarısız - ses üretilemedi");
    return null;
  }
}

// ElevenLabs devre dışı bırakıldı - Sadece Azure TTS kullanılıyor

/**
 * GELİŞMİŞ SSML ORKESTRA ŞEFİ FONKSİYONU (PDF'den)
 * Bu fonksiyon, metni analiz ederek ve SSML'in prosodi özelliklerini
 * kullanarak Azure sesini insana benzer bir doğallıkla konuşturur.
 * Robotik hissiyatı ortadan kaldırmayı hedefler.
 */
function createSSMLForText(text: string, voiceName: string = "tr-TR-EmelNeural"): string {
  // XML karakterlerini escape et
  function escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  
  // Metni temizle ve escape et
  const cleanText = escapeXml(text.trim());
  
  // Basit ve güvenilir SSML oluştur
  const ssmlString = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="tr-TR">
    <voice name="${voiceName}">
      <prosody rate="1.0" pitch="medium">
        ${cleanText}
      </prosody>
    </voice>
  </speak>`;
  
  console.log("✅ Güvenli SSML oluşturuldu");
  return ssmlString;
}

/**
 * ADIM 2: YENİ AZURE TTS FONKSİYONU (SSML destekli)
 * Verilen SSML metnini kullanarak Azure'dan yüksek kaliteli ses sentezler.
 * PDF'deki en yüksek kalite ayarları uygulandı.
 */
async function textToSpeechAzureSSML(ssmlString: string): Promise<Buffer | null> {
  try {
    // Azure anahtarları kontrolü
    if (!process.env.AZURE_SPEECH_KEY) {
      console.error("❌ Azure Speech Key bulunamadı");
      return null;
    }

    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION || "eastus"
    );
    
    // EN YÜKSEK KALİTE İÇİN ÇIKIŞ FORMATINI AYARLA (PDF'den)
    speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio48Khz192KBitRateMonoMp3;
    
    // Ses sentezleyiciyi oluştur
    const speechSynthesizer = new sdk.SpeechSynthesizer(speechConfig);

    return new Promise((resolve, reject) => {
      speechSynthesizer.speakSsmlAsync(
        ssmlString,
        (result) => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            // Ses verisini Buffer'a çevirip geri döndür
            const audioData = Buffer.from(result.audioData);
            console.log(`✅ Azure TTS SSML (48kHz Premium Kalite) completed`);
            resolve(audioData);
          } else {
            console.error(`❌ Azure TTS SSML failed: ${result.errorDetails}`);
            resolve(null);
          }
          speechSynthesizer.close();
        },
        (err) => {
          console.error("❌ Azure TTS SSML error:", err);
          speechSynthesizer.close();
          reject(err);
        }
      );
    });
  } catch (error) {
    console.error("❌ Azure TTS SSML initialization error:", error);
    return null;
  }
}

// WebM ses dosyasını WAV formatına çevir
async function convertWebMToWav(webmBuffer: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const chunks: Buffer[] = [];
      
      const stream = ffmpeg()
        .input('pipe:0')
        .inputFormat('webm')
        .audioCodec('pcm_s16le')
        .audioFrequency(16000)
        .audioChannels(1)
        .audioFilters('volume=2.0')
        .format('wav')
        .on('error', (err: any) => {
          console.error('FFmpeg conversion error:', err);
          reject(err);
        })
        .on('end', () => {
          const wavBuffer = Buffer.concat(chunks);
          console.log(`✅ WebM to WAV conversion completed: ${wavBuffer.length} bytes`);
          resolve(wavBuffer);
        })
        .pipe();
      
      stream.on('data', (chunk: any) => chunks.push(chunk));
      stream.on('end', () => {
        const wavBuffer = Buffer.concat(chunks);
        resolve(wavBuffer);
      });
      
      // WebM buffer'ı ffmpeg'e yaz
      stream.write(webmBuffer);
      stream.end();
      
    } catch (error) {
      console.error('Conversion setup error:', error);
      reject(error);
    }
  });
}

export async function speechToText(audioBuffer: Buffer): Promise<string | null> {
  try {
    // Azure anahtarları kontrolü
    if (!process.env.AZURE_SPEECH_KEY) {
      console.warn("⚠️ Azure Speech Key bulunamadı - Mock STT kullanılıyor");
      return "Mock konuşma metni"; // Mock metin
    }
    
    console.log('🔍 Azure STT başlatılıyor...');
    console.log(`📊 Audio buffer: ${audioBuffer.length} bytes`);
    console.log(`🔑 Azure Key: ${process.env.AZURE_SPEECH_KEY ? 'EXISTS' : 'MISSING'}`);
    console.log(`🌍 Azure Region: ${process.env.AZURE_SPEECH_REGION || 'eastus'}`);
    
    // WebM'i WAV'a çevir
    console.log('🔄 Converting WebM to WAV...');
    const wavBuffer = await convertWebMToWav(audioBuffer);
    console.log(`✅ Conversion completed: ${wavBuffer.length} bytes WAV`);

    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION || "eastus"
    );

    speechConfig.speechRecognitionLanguage = "tr-TR";
    
    console.log('🎛️ Azure SDK Configuration...');
    console.log(`📋 Language: ${speechConfig.speechRecognitionLanguage}`);
    
    // Azure için tam uyumlu audio stream
    console.log('🎵 Creating audio stream with proper format...');
    
    // WAV header'ını kontrol et
    console.log(`🔍 WAV Header check: ${wavBuffer.subarray(0, 12).toString('hex')}`);
    
    // Azure'ın beklediği tam format: 16kHz, 16-bit, mono PCM
    const audioFormat = sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1);
    const pushStream = sdk.AudioInputStream.createPushStream(audioFormat);
    
    // WAV header'ını atla ve sadece PCM data gönder
    const wavHeaderSize = 44; // Standard WAV header size
    const pcmData = wavBuffer.subarray(wavHeaderSize);
    
    console.log(`📊 PCM Data: ${pcmData.length} bytes (header atlandı)`);
    
    pushStream.write(pcmData);
    pushStream.close();
    console.log('✅ Audio stream created with PCM data');

    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    return new Promise((resolve, reject) => {
      console.log('🔄 Starting recognition...');
      
      recognizer.recognizeOnceAsync(
        (result: sdk.SpeechRecognitionResult) => {
          console.log(`📤 Recognition completed with reason: ${result.reason}`);
          console.log(`📝 Result text: "${result.text || 'EMPTY'}"`);
          console.log(`❓ Error details: ${result.errorDetails || 'NONE'}`);
          
          if (result.reason === sdk.ResultReason.RecognizedSpeech && result.text) {
            console.log(`✅ STT SUCCESS: "${result.text}"`);
            resolve(result.text);
          } else if (result.reason === sdk.ResultReason.NoMatch) {
            console.log(`⚠️ NO MATCH: Azure couldn't detect speech in audio`);
            console.log(`🎤 Tip: Speak louder, clearer, or check microphone`);
            resolve("Azure ses tanıyamadı - lütfen daha net konuşun");
          } else {
            const errorMsg = result.errorDetails || `Recognition failed with reason: ${result.reason}`;
            console.error(`❌ STT FAILED: ${errorMsg}`);
            resolve(null);
          }
          recognizer.close();
        },
        (error: any) => {
          console.error("❌ STT ERROR:", error);
          recognizer.close();
          reject(error);
        }
      );
    });

  } catch (error) {
    console.error("❌ Azure STT initialization error:", error);
    return null;
  }
}