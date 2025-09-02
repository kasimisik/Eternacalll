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
  // Kural 1: Cümleleri doğal duraksamalarla böl
  // Virgüllerden sonra kısa, cümle sonlarından sonra biraz daha uzun nefes payı bırak.
  let processedText = text.replace(/,/g, '<break time="250ms"/>');
  
  // Başlangıç SSML yapısını oluştur
  let ssmlBody = "";
  
  // Cümleleri "." veya "?"'ye göre ayır ve her birini ayrı ayrı işle
  const sentences = processedText.split(/([.?!])/).filter(s => s.trim().length > 0);
  
  for (let i = 0; i < sentences.length; i += 2) {
    const sentence = sentences[i];
    const punctuation = sentences[i + 1] || '';
    const fullSentence = (sentence + punctuation).trim();
    
    if (!fullSentence) continue;
    
    let processedSentence = fullSentence;
    
    // Kural 2: Soruları doğal bir tonlama ile sor
    // Soru cümlelerinin sonuna doğru ses perdesini hafifçe yükselt.
    if (fullSentence.includes('?')) {
      // Sorunun kendisini daha yavaş ve net sor, sonunu yükselt
      processedSentence = `<prosody rate="-5%" pitch="+8%">${fullSentence}</prosody>`;
    }
    
    // Kural 3: Heyecan veya olumlu ifadelerde tonu ve hızı ayarla
    const positiveWords = ["harika", "mükemmel", "tebrikler", "muhteşem", "elbette", "merhaba", "hoş geldin"];
    if (positiveWords.some(word => fullSentence.toLowerCase().includes(word))) {
      // Daha pozitif bir ton için sesi hafifçe incelt ve hızlandır
      processedSentence = `<mstts:express-as style="cheerful"><prosody rate="+5%" pitch="+5%">${fullSentence}</prosody></mstts:express-as>`;
    }
    
    // Kural 4: Önemli veya teknik terimleri yavaşlatarak vurgula
    // Örneğin, tırnak içindeki kelimeleri daha yavaş ve net söyle
    if (fullSentence.includes('"')) {
      const parts = fullSentence.split('"');
      if (parts.length >= 3) {
        processedSentence = `${parts[0]} <prosody rate="-15%">"${parts[1]}"</prosody> ${parts[2]}`;
      }
    }
    
    ssmlBody += processedSentence + ' <break time="400ms"/> ';
  }
  
  // Final SSML'i oluştur
  const ssmlString = `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"
           xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="tr-TR">
      <voice name="${voiceName}">
        <prosody rate="1.0" pitch="medium">
          ${ssmlBody}
        </prosody>
      </voice>
    </speak>
  `;
  
  console.log("✅ Gelişmiş SSML oluşturuldu - Doğal tonlama aktif");
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
    
    // WebM'i WAV'a çevir
    console.log('🔄 Converting WebM to WAV...');
    const wavBuffer = await convertWebMToWav(audioBuffer);
    console.log(`✅ Conversion completed: ${wavBuffer.length} bytes WAV`);

    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION || "eastus"
    );

    speechConfig.speechRecognitionLanguage = "tr-TR";

    // WAV audio stream oluştur
    const pushStream = sdk.AudioInputStream.createPushStream();
    pushStream.write(wavBuffer);
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
            const errorMsg = result.errorDetails || `Recognition failed with reason: ${result.reason}`;
            console.error(`❌ STT failed: ${errorMsg}`);
            console.error(`STT Result reason: ${result.reason}`);
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