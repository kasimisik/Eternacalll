import { NetgsmVoiceAgent } from './sip-voice-agent';

// Netgsm SIP Voice Agent'ı başlat
export async function startSipVoiceAgent() {
  console.log("🎯 Netgsm SIP Voice Agent başlatılıyor...");
  
  const agent = new NetgsmVoiceAgent();
  
  // Graceful shutdown için signal handler'ları ekle
  process.on('SIGINT', () => {
    console.log("💫 Voice Agent kapatılıyor...");
    agent.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log("💫 Voice Agent kapatılıyor...");
    agent.stop();
    process.exit(0);
  });

  // Agent'ı başlat
  try {
    await agent.start();
  } catch (error) {
    console.error("❌ Voice Agent başlatma hatası:", error);
    process.exit(1);
  }
}

// Eğer bu dosya direkt çalıştırılırsa agent'ı başlat
if (require.main === module) {
  startSipVoiceAgent();
}