import * as sdk from "microsoft-cognitiveservices-speech-sdk";

// Bu fonksiyon, metni sese dönüştürüp ses verisini Buffer olarak döndürür
export async function textToSpeech(text: string): Promise<Buffer | null> {
  try {
    // Azure anahtarları kontrolü
    if (!process.env.AZURE_SPEECH_KEY) {
      console.warn("⚠️ Azure Speech Key bulunamadı - Mock TTS kullanılıyor");
      return Buffer.from("mock-audio-data", 'utf-8'); // Mock ses verisi
    }

    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION || "eastus"
    );
    
    // Türkiye için yüksek kaliteli, doğal erkek sesi
    speechConfig.speechSynthesisVoiceName = "tr-TR-AhmetNeural"; 

    // Ses sentezleyiciyi oluştur
    const speechSynthesizer = new sdk.SpeechSynthesizer(speechConfig);

    return new Promise((resolve, reject) => {
      speechSynthesizer.speakTextAsync(
        text,
        (result) => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            // Ses verisini Buffer'a çevirip geri döndür
            const audioData = Buffer.from(result.audioData);
            console.log(`✅ TTS completed: "${text}"`);
            resolve(audioData);
          } else {
            console.error(`❌ TTS failed: ${result.errorDetails}`);
            resolve(null);
          }
          speechSynthesizer.close();
        },
        (err) => {
          console.error("❌ TTS error:", err);
          speechSynthesizer.close();
          reject(err);
        }
      );
    });
  } catch (error) {
    console.error("❌ Azure TTS initialization error:", error);
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