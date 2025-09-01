import * as sdk from "microsoft-cognitiveservices-speech-sdk";

// Bu fonksiyon, metni sese dönüştürüp ses verisini Buffer olarak döndürür
export async function textToSpeech(text: string): Promise<Buffer> {
  const speechConfig = sdk.SpeechConfig.fromSubscription(
    process.env.AZURE_API_KEY!,
    process.env.AZURE_REGION!
  );
  
  // Türkiye için yüksek kaliteli, doğal kadın sesi
  speechConfig.speechSynthesisVoiceName = "tr-TR-EmelNeural"; 

  // Ses sentezleyiciyi oluştur
  const speechSynthesizer = new sdk.SpeechSynthesizer(speechConfig);

  return new Promise((resolve, reject) => {
    speechSynthesizer.speakTextAsync(
      text,
      (result) => {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          // Ses verisini Buffer'a çevirip geri döndür
          const audioData = Buffer.from(result.audioData);
          resolve(audioData);
        } else {
          console.error("Speech synthesis canceled, " + result.errorDetails);
          reject(new Error(result.errorDetails));
        }
        speechSynthesizer.close();
      },
      (err) => {
        console.trace("err - " + err);
        speechSynthesizer.close();
        reject(err);
      }
    );
  });
}