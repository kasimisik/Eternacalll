import * as sdk from "microsoft-cognitiveservices-speech-sdk";

// Bu fonksiyon, metni sese dönüştürüp ses verisini Buffer olarak döndürür
export async function textToSpeech(text: string): Promise<Buffer | null> {
  // ElevenLabs'ı önceleyip daha doğal ses için kullan
  const elevenLabsResult = await textToSpeechElevenLabs(text);
  if (elevenLabsResult) {
    return elevenLabsResult;
  }

  // ElevenLabs başarısız olursa Azure TTS'ye geç
  console.log("🔄 ElevenLabs TTS failed, trying Azure TTS...");
  return await textToSpeechAzure(text);
}

// ElevenLabs Text-to-Speech (öncelikli)
async function textToSpeechElevenLabs(text: string): Promise<Buffer | null> {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY_NEW || process.env.ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      console.log("⚠️ ElevenLabs API Key bulunamadı - Azure TTS'ye geçiliyor");
      return null;
    }

    // Türkçe için optimize edilmiş güzel kadın sesi - multilingual
    const voiceId = "21m00Tcm4TlvDq8ikWAM"; // Rachel voice - multilingual, çok doğal kadın sesi
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.85,
          style: 0.3,
          use_speaker_boost: true
        },
        pronunciation_dictionary_locators: []
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ ElevenLabs API error: ${response.status} - ${errorText}`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log(`✅ ElevenLabs TTS completed: "${text}" (${buffer.length} bytes)`);
    return buffer;

  } catch (error) {
    console.error('❌ ElevenLabs TTS error:', error);
    return null;
  }
}

// Azure Text-to-Speech (fallback)
async function textToSpeechAzure(text: string): Promise<Buffer | null> {
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
    
    // Türkiye için desteklenen doğal kadın sesi
    speechConfig.speechSynthesisVoiceName = "tr-TR-EmelNeural"; 

    // Ses sentezleyiciyi oluştur
    const speechSynthesizer = new sdk.SpeechSynthesizer(speechConfig);

    // SSML kullanarak daha doğal ve duygusal konuşma
    const ssmlText = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="tr-TR">
        <voice name="tr-TR-EmelNeural">
          <prosody rate="0.9" pitch="+5%">
            <express-as style="friendly" styledegree="2">
              ${text}
            </express-as>
          </prosody>
        </voice>
      </speak>
    `;

    return new Promise((resolve, reject) => {
      speechSynthesizer.speakSsmlAsync(
        ssmlText,
        (result) => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            // Ses verisini Buffer'a çevirip geri döndür
            const audioData = Buffer.from(result.audioData);
            console.log(`✅ Azure TTS (Emel Neural) completed: "${text}"`);
            resolve(audioData);
          } else {
            console.error(`❌ Azure TTS failed: ${result.errorDetails}`);
            resolve(null);
          }
          speechSynthesizer.close();
        },
        (err) => {
          console.error("❌ Azure TTS error:", err);
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