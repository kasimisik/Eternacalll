import * as sdk from "microsoft-cognitiveservices-speech-sdk";

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
 * ADIM 1: AKILLI SSML ÜRETİCİ FONKSİYONU
 * Anthropic'ten gelen düz metni analiz edip Azure'un anlayacağı zengin SSML formatına dönüştürür.
 * Bu, kaliteyi artıran sihirli adımdır (PDF'den uyarlandı).
 */
function createSSMLForText(text: string, voiceName: string = "tr-TR-EmelNeural"): string {
  let ssmlBody = text;
  
  // Kural 1: Neşeli karşılama ve tebrikler
  const positiveWords = ["merhaba", "hoş geldin", "harika", "mükemmel", "tebrikler", "başladık", "hazırım"];
  if (positiveWords.some(word => text.toLowerCase().includes(word))) {
    // Neşeli bir tonla söylet
    ssmlBody = `<mstts:express-as style="cheerful">${text}</mstts:express-as>`;
  }
  // Kural 2: Soruları daha doğal hale getirme
  else if (text.includes('?')) {
    // Sorunun son kelimesinin perdesini hafifçe yükselterek doğal bir soru tonu ver
    const words = text.split(' ');
    if (words.length >= 3) {
      const questionPart = words.slice(-3).join(' '); // Son 3 kelimeyi al
      const mainPart = words.slice(0, -3).join(' ');
      ssmlBody = `${mainPart} <prosody pitch="+15%">${questionPart}</prosody>`;
    } else {
      ssmlBody = `<prosody pitch="+10%">${text}</prosody>`;
    }
  }
  // Kural 3: Vurgu ekleme (Örnek: tırnak içindeki kelimeler)
  else if (text.includes('"')) {
    // Tırnak içindeki kelimeleri daha vurgulu yap
    ssmlBody = text.replace(/"([^"]+)"/g, '<emphasis level="strong">$1</emphasis>');
  }
  // Kural 4: Önemli kelimeler için vurgu
  else if (text.toLowerCase().includes('önemli') || text.toLowerCase().includes('dikkat')) {
    ssmlBody = text.replace(/(önemli|dikkat)/gi, '<emphasis level="moderate">$1</emphasis>');
  }

  // Final SSML'i oluştur
  const ssmlString = `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"
           xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="tr-TR">
      <voice name="${voiceName}">
        <prosody rate="0.95" pitch="+3%">
          ${ssmlBody}
        </prosody>
      </voice>
    </speak>
  `;
  
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

export async function speechToText(audioBuffer: Buffer): Promise<string | null> {
  try {
    // Azure anahtarları kontrolü
    if (!process.env.AZURE_SPEECH_KEY) {
      console.warn("⚠️ Azure Speech Key bulunamadı - Mock STT kullanılıyor");
      return "Mock konuşma metni"; // Mock metin
    }

    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION || "eastus"
    );

    speechConfig.speechRecognitionLanguage = "tr-TR";

    // Audio stream oluştur
    const pushStream = sdk.AudioInputStream.createPushStream();
    pushStream.write(audioBuffer);
    pushStream.close();

    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    return new Promise((resolve, reject) => {
      recognizer.recognizeOnceAsync(
        (result: sdk.SpeechRecognitionResult) => {
          if (result.reason === sdk.ResultReason.RecognizedSpeech) {
            console.log(`✅ STT completed: "${result.text}"`);
            resolve(result.text);
          } else {
            console.error(`❌ STT failed: ${result.errorDetails}`);
            resolve(null);
          }
          recognizer.close();
        },
        (error: any) => {
          console.error("❌ STT error:", error);
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