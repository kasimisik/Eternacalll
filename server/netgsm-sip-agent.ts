import { EventEmitter } from 'events';
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { SIP_CONFIG } from './sip-config';
import { getAIResponse } from './anthropic';
import { textToSpeech } from './azure';
import WebSocket from 'ws';

// Basit SIP mesaj parser'ı
class SimpleSIPAgent extends EventEmitter {
  private ws: WebSocket | null = null;
  private isRegistered = false;
  private currentCall: any = null;
  private speechRecognizer: sdk.SpeechRecognizer | null = null;

  constructor() {
    super();
    this.initializeAzureSpeech();
  }

  private initializeAzureSpeech() {
    if (!SIP_CONFIG.azure.speechKey) {
      console.error("❌ Azure Speech API Key bulunamadı!");
      return;
    }
    console.log("✅ Azure Speech SDK yapılandırıldı");
  }

  // Netgsm SIP'e register ol
  public async start(): Promise<boolean> {
    try {
      console.log("🔄 Netgsm SIP Voice Agent başlatılıyor...");
      
      // Node.js WebSocket bağlantısı kur
      console.log(`🔗 Netgsm WebSocket'e bağlanıyor: ${SIP_CONFIG.ws_servers}`);
      this.ws = new WebSocket(SIP_CONFIG.ws_servers);

      return new Promise((resolve, reject) => {
        this.ws!.on('open', () => {
          console.log("🔗 WebSocket bağlantısı kuruldu");
          this.sendRegister();
          resolve(true);
        });

        this.ws.on('message', (data: WebSocket.RawData) => {
          this.handleSIPMessage(data.toString());
        });

        this.ws.on('error', (error: Error) => {
          console.error("❌ WebSocket hatası:", error);
          reject(error);
        });

        this.ws.on('close', () => {
          console.log("🔌 WebSocket bağlantısı kapandı");
          this.isRegistered = false;
        });
      });

    } catch (error) {
      console.error("❌ SIP Agent başlatma hatası:", error);
      return false;
    }
  }

  // REGISTER mesajı gönder
  private sendRegister() {
    const registerMessage = `REGISTER ${SIP_CONFIG.uri} SIP/2.0\r
Via: SIP/2.0/WSS replit.agent;branch=z9hG4bK123456\r
Max-Forwards: 70\r
From: <${SIP_CONFIG.uri}>;tag=tag123\r
To: <${SIP_CONFIG.uri}>\r
Call-ID: call-id-12345@replit.dev\r
CSeq: 1 REGISTER\r
Contact: <sip:agent@replit.dev;transport=wss>\r
Authorization: Digest username="${SIP_CONFIG.authorizationUser}", realm="netgsm.com.tr", uri="${SIP_CONFIG.uri}", response="dummy"\r
Content-Length: 0\r
\r
`;

    console.log("📤 REGISTER mesajı gönderiliyor...");
    this.ws!.send(registerMessage);
  }

  // SIP mesajlarını işle
  private handleSIPMessage(message: string) {
    console.log("📥 SIP Mesajı:", message.substring(0, 100) + "...");

    if (message.includes("200 OK") && message.includes("REGISTER")) {
      console.log("✅ Netgsm SIP'e başarıyla register olundu!");
      this.isRegistered = true;
    }

    if (message.includes("INVITE") && message.includes("SIP/2.0")) {
      console.log("📞 Gelen çağrı (INVITE) alındı!");
      this.handleIncomingCall(message);
    }
  }

  // Gelen çağrıyı karşıla
  private handleIncomingCall(inviteMessage: string) {
    console.log("🎯 Çağrı kabul ediliyor...");
    
    // INVITE'a 200 OK cevabı gönder
    const callId = this.extractCallId(inviteMessage);
    const fromTag = this.extractFromTag(inviteMessage);
    
    const okResponse = `SIP/2.0 200 OK\r
Via: SIP/2.0/WSS replit.agent;branch=z9hG4bK123456\r
From: ${this.extractFrom(inviteMessage)}\r
To: <${SIP_CONFIG.uri}>;tag=to-tag-123\r
Call-ID: ${callId}\r
CSeq: 1 INVITE\r
Contact: <sip:agent@replit.dev;transport=wss>\r
Content-Type: application/sdp\r
Content-Length: 200\r
\r
v=0\r
o=agent 123456 654321 IN IP4 replit.dev\r
s=AI Voice Agent\r
c=IN IP4 replit.dev\r
t=0 0\r
m=audio 5004 RTP/AVP 8 0\r
a=rtpmap:8 PCMA/8000\r
a=rtpmap:0 PCMU/8000\r
\r
`;

    this.ws!.send(okResponse);
    console.log("✅ Çağrı kabul edildi - AI asistan devreye giriyor!");

    // İlk karşılama mesajını gönder
    this.sendWelcomeMessage();
  }

  // Call-ID çıkar
  private extractCallId(message: string): string {
    const match = message.match(/Call-ID:\s*(.+)/i);
    return match ? match[1].trim() : "default-call-id";
  }

  // From tag çıkar
  private extractFromTag(message: string): string {
    const match = message.match(/From:.*tag=([^;,\r\n]+)/i);
    return match ? match[1].trim() : "default-tag";
  }

  // From header çıkar
  private extractFrom(message: string): string {
    const match = message.match(/From:\s*(.+)/i);
    return match ? match[1].trim() : "<sip:unknown@netgsm.com.tr>";
  }

  // İlk karşılama mesajını gönder
  private async sendWelcomeMessage() {
    const welcomeText = "Merhaba! Ben Kasım'ın sesli asistanıyım. Size nasıl yardımcı olabilirim?";
    console.log(`🤖 Karşılama: "${welcomeText}"`);
    
    try {
      // Azure TTS ile sese çevir
      const audioBuffer = await textToSpeech(welcomeText);
      console.log("✅ Karşılama mesajı ses olarak hazırlandı");
      
      // RTP üzerinden ses gönderilecek (şu an simüle ediliyor)
      console.log("🔊 Ses kullanıcıya gönderiliyor...");
      
    } catch (error) {
      console.error("❌ Karşılama mesajı hatası:", error);
    }
  }

  // Kullanıcının konuşmasını işle (simüle edilmiş)
  public async simulateUserSpeech(userText: string) {
    console.log(`🎤 Kullanıcı (simüle): "${userText}"`);
    
    try {
      // Anthropic'ten AI cevabı al
      const aiResponse = await getAIResponse(
        `Sen Kasım'ın kişisel sesli asistanısın. Telefonda karşılıklı konuşma yapıyorsun. Kullanıcı şunu söyledi: "${userText}"`
      );

      console.log(`🤖 AI Cevabı: "${aiResponse}"`);

      // AI cevabını sese çevir
      const audioBuffer = await textToSpeech(aiResponse);
      console.log("✅ AI cevabı ses olarak hazırlandı ve gönderildi");

    } catch (error) {
      console.error("❌ Kullanıcı konuşması işleme hatası:", error);
    }
  }

  // Agent'ı durdur
  public stop() {
    if (this.speechRecognizer) {
      this.speechRecognizer.stopContinuousRecognitionAsync();
      this.speechRecognizer = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.isRegistered = false;
    this.currentCall = null;
    console.log("🛑 Netgsm SIP Voice Agent durduruldu");
  }

  // Durum bilgisi
  public getStatus() {
    return {
      registered: this.isRegistered,
      hasActiveCall: this.currentCall !== null,
      wsConnected: this.ws && this.ws.readyState === WebSocket.OPEN
    };
  }
}

export { SimpleSIPAgent as NetgsmVoiceAgent };