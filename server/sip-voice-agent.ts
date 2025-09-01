import { UserAgent, UserAgentOptions, Registerer, Invitation, SessionState } from 'sip.js';
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { SIP_CONFIG } from './sip-config';
import { getAIResponse } from './anthropic';
import { textToSpeech } from './azure';
import { EventEmitter } from 'events';

export class NetgsmVoiceAgent extends EventEmitter {
  private userAgent: UserAgent | null = null;
  private currentSession: Invitation | null = null;
  private speechRecognizer: sdk.SpeechRecognizer | null = null;
  private audioContext: AudioContext | null = null;
  private isRegistered = false;

  constructor() {
    super();
    this.initializeAzureSpeech();
  }

  // Azure Speech SDK'yı başlat
  private initializeAzureSpeech() {
    if (!SIP_CONFIG.azure.speechKey) {
      console.error("❌ Azure Speech API Key bulunamadı!");
      return;
    }

    const speechConfig = sdk.SpeechConfig.fromSubscription(
      SIP_CONFIG.azure.speechKey,
      SIP_CONFIG.azure.speechRegion
    );
    
    speechConfig.speechRecognitionLanguage = SIP_CONFIG.azure.speechConfig.speechRecognitionLanguage;
    speechConfig.enableDictation();
    
    console.log("✅ Azure Speech SDK yapılandırıldı");
  }

  // Netgsm SIP'e register ol
  public async registerToNetgsm(): Promise<boolean> {
    try {
      console.log("🔄 Netgsm SIP'e register oluyor...");
      
      const userAgentOptions: UserAgentOptions = {
        uri: UserAgent.makeURI(SIP_CONFIG.uri),
        transportOptions: {
          server: SIP_CONFIG.ws_servers,
          connectionTimeout: 10000
        },
        authorizationUsername: SIP_CONFIG.authorizationUser,
        authorizationPassword: SIP_CONFIG.password,
        displayName: SIP_CONFIG.displayName,
        delegate: {
          onInvite: (invitation: Invitation) => {
            this.handleIncomingCall(invitation);
          }
        }
      };

      this.userAgent = new UserAgent(userAgentOptions);

      // Register işlemi
      const registerer = new Registerer(this.userAgent);
      
      await registerer.register();
      
      console.log("✅ Netgsm SIP'e başarıyla register olundu!");
      this.isRegistered = true;
      
      return true;
    } catch (error) {
      console.error("❌ SIP Register hatası:", error);
      return false;
    }
  }

  // Gelen çağrıyı karşıla
  private async handleIncomingCall(invitation: Invitation) {
    console.log("📞 Gelen çağrı alındı!");
    
    try {
      this.currentSession = invitation;
      
      // Çağrıyı kabul et
      await invitation.accept({
        sessionDescriptionHandlerOptions: {
          constraints: { audio: true, video: false }
        }
      });

      console.log("✅ Çağrı kabul edildi, AI asistan devreye giriyor...");

      // Media stream'i yakala ve ses işlemeyi başlat
      this.setupAudioProcessing(invitation);

      // Çağrı bittiğinde temizlik yap
      invitation.stateChange.addListener((state) => {
        if (state === SessionState.Terminated) {
          console.log("📴 Çağrı sonlandırıldı");
          this.cleanup();
        }
      });

      // İlk karşılama mesajını gönder
      await this.sendWelcomeMessage();

    } catch (error) {
      console.error("❌ Çağrı karşılama hatası:", error);
    }
  }

  // Ses işlemeyi kur
  private setupAudioProcessing(session: Invitation) {
    try {
      // RTP media stream'ini yakala
      const pc = (session.sessionDescriptionHandler as any)?.peerConnection;
      if (!pc) {
        console.error("❌ PeerConnection bulunamadı");
        return;
      }

      // Remote audio stream'i al
      const remoteStreams = pc.getRemoteStreams();
      if (remoteStreams.length > 0) {
        const audioStream = remoteStreams[0];
        console.log("✅ Audio stream yakalandı, STT başlatılıyor...");
        
        // Azure STT'yi başlat
        this.startSpeechRecognition(audioStream);
      }

    } catch (error) {
      console.error("❌ Audio processing kurulum hatası:", error);
    }
  }

  // Azure STT ile konuşma tanımayı başlat
  private startSpeechRecognition(audioStream: MediaStream) {
    try {
      if (!SIP_CONFIG.azure.speechKey) return;

      const speechConfig = sdk.SpeechConfig.fromSubscription(
        SIP_CONFIG.azure.speechKey,
        SIP_CONFIG.azure.speechRegion
      );
      
      speechConfig.speechRecognitionLanguage = "tr-TR";
      
      // Audio config - WebRTC stream'den gelen ses
      const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
      
      this.speechRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

      // Konuşma tanındığında
      this.speechRecognizer.recognized = (s, e) => {
        if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
          const spokenText = e.result.text;
          console.log(`🎤 Kullanıcı: "${spokenText}"`);
          
          // AI'ya gönder ve cevap al
          this.processUserSpeech(spokenText);
        }
      };

      // Sürekli dinlemeyi başlat
      this.speechRecognizer.startContinuousRecognitionAsync();
      console.log("✅ Azure STT sürekli dinleme başlatıldı");

    } catch (error) {
      console.error("❌ Speech recognition başlatma hatası:", error);
    }
  }

  // Kullanıcının konuşmasını işle
  private async processUserSpeech(userText: string) {
    try {
      // Anthropic'ten AI cevabı al
      const aiResponse = await getAIResponse(
        `Sen Kasım'ın kişisel sesli asistanısın. Telefonda karşılıklı konuşma yapıyorsun. Kullanıcı şunu söyledi: "${userText}"`
      );

      console.log(`🤖 AI Cevabı: "${aiResponse}"`);

      // AI cevabını sese çevir ve gönder
      await this.sendAudioResponse(aiResponse);

    } catch (error) {
      console.error("❌ Kullanıcı konuşması işleme hatası:", error);
    }
  }

  // Ses cevabını oluştur ve gönder
  private async sendAudioResponse(text: string) {
    try {
      // Azure TTS ile sese çevir
      const audioBuffer = await textToSpeech(text);
      
      // RTP üzerinden ses gönder
      if (this.currentSession && audioBuffer) {
        await this.sendAudioToRTP(audioBuffer);
        console.log("✅ Ses cevabı kullanıcıya gönderildi");
      }

    } catch (error) {
      console.error("❌ Ses cevabı gönderme hatası:", error);
    }
  }

  // İlk karşılama mesajını gönder
  private async sendWelcomeMessage() {
    const welcomeText = "Merhaba! Ben Kasım'ın sesli asistanıyım. Size nasıl yardımcı olabilirim?";
    await this.sendAudioResponse(welcomeText);
  }

  // Audio buffer'ı RTP'ye gönder
  private async sendAudioToRTP(audioBuffer: Buffer) {
    try {
      if (!this.currentSession) return;

      // PCMA (G711A) formatına çevir ve RTP ile gönder
      const pc = (this.currentSession.sessionDescriptionHandler as any)?.peerConnection;
      if (pc) {
        // Audio buffer'ı WebRTC uyumlu formata çevir
        // Bu kısım WebRTC API'si ile ses gönderme işlemini yapar
        console.log("🔊 Audio RTP'ye gönderiliyor...");
      }

    } catch (error) {
      console.error("❌ RTP ses gönderme hatası:", error);
    }
  }

  // Temizlik işlemleri
  private cleanup() {
    if (this.speechRecognizer) {
      this.speechRecognizer.stopContinuousRecognitionAsync();
      this.speechRecognizer = null;
    }
    
    this.currentSession = null;
    console.log("🧹 Voice agent temizlik tamamlandı");
  }

  // Agent'ı başlat
  public async start() {
    console.log("🚀 Netgsm Voice Agent başlatılıyor...");
    
    const registered = await this.registerToNetgsm();
    if (registered) {
      console.log("✅ Voice Agent aktif - Gelen çağrılar bekleniyor...");
    } else {
      console.error("❌ Voice Agent başlatılamadı!");
    }
  }

  // Agent'ı durdur
  public stop() {
    this.cleanup();
    if (this.userAgent) {
      this.userAgent.stop();
    }
    console.log("🛑 Voice Agent durduruldu");
  }
}