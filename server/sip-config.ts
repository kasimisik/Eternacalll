export const SIP_CONFIG = {
  // Netgsm SIP yapılandırması
  uri: process.env.SIP_URI || "sip:905xxxxxxx@sip.netgsm.com.tr",
  ws_servers: process.env.SIP_WS_SERVER || "wss://sip.netgsm.com.tr",
  authorizationUser: process.env.SIP_USERNAME || "905xxxxxxx",
  password: process.env.SIP_PASSWORD || "",
  displayName: "AI Voice Agent",
  
  // SIP ayarları
  register: true,
  registerExpires: 300,
  transportOptions: {
    traceSip: true,
    wsServers: process.env.SIP_WS_SERVER || "wss://sip.netgsm.com.tr"
  },
  
  // Ses codec ayarları
  mediaHandlerFactory: {
    createMediaHandler: (session: any, options: any) => {
      // PCMA (G711A) veya PCMU codec'ini kullan
      return {
        getConfiguration: () => ({
          iceServers: [],
          bundlePolicy: 'balanced',
          rtcpMuxPolicy: 'require'
        })
      };
    }
  },
  
  // Azure STT/TTS ayarları
  azure: {
    speechKey: process.env.AZURE_API_KEY,
    speechRegion: process.env.AZURE_REGION || "westeurope",
    speechConfig: {
      speechRecognitionLanguage: "tr-TR",
      speechSynthesisLanguage: "tr-TR",
      speechSynthesisVoiceName: "tr-TR-EmelNeural"
    }
  }
};