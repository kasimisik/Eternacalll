"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  SidebarProvider,
  NewSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/new-sidebar";
import { LayoutDashboard, UserCog, Settings, LogOut, Bot, Crown, CreditCard, Menu, FileText, Mic, User } from "lucide-react";
import { Link } from "wouter";
import { useUserHook, useAuthHook } from '@/lib/auth-hook';
import SiriOrb from "@/components/ui/siri-orb";
import AnoAI from "@/components/ui/animated-shader-background";
import { RainbowButton } from '@/components/ui/rainbow-button';
import { ModalPricing } from '@/components/ui/modal-pricing';
import { AIVoiceInput } from "@/components/ui/ai-voice-input";
import {
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  PopoverFooter,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MicVAD } from "@ricky0123/vad-web";

export default function VoiceAssistant() {
  const { user } = useUserHook();
  const { signOut } = useAuthHook();
  const [subscription, setSubscription] = useState<{
    hasSubscription: boolean;
    plan: string;
    email?: string;
    createdAt?: string;
  } | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isVADActive, setIsVADActive] = useState(false);
  const [isHandsfreeMode, setIsHandsfreeMode] = useState(false);
  
  // VAD referansları
  const vadRef = useRef<any>(null);
  const currentStreamRef = useRef<MediaStream | null>(null);

  const data = {
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
        isActive: false,
      },
      {
        title: "Sesli Asistan",
        url: "/voice-assistant",
        icon: Mic,
        isActive: true,
      },
      {
        title: "Templates",
        url: "/templates",
        icon: FileText,
      },
    ],
  };

  // Kullanıcının abonelik durumunu kontrol et
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user?.id) return;
      
      try {
        setLoadingSubscription(true);
        const response = await fetch(`/api/user/subscription/${user.id}`);
        const data = await response.json();
        
        console.log('Subscription data:', data);
        setSubscription(data);
      } catch (error) {
        console.error('Subscription check failed:', error);
      } finally {
        setLoadingSubscription(false);
      }
    };

    checkSubscription();
  }, [user?.id]);

  // WebSocket bağlantısı kur
  useEffect(() => {
    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/voice-chat`;
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('🔌 WebSocket connected');
        setIsConnected(true);
        setWebSocket(ws);
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('📩 WebSocket message received:', data.type, 'audioData length:', data.audioData ? data.audioData.length : 'none');
        
        if (data.type === 'response') {
          setIsProcessing(false);
          
          // Agresif otomatik yeniden başlatma - response aldıktan hemen sonra
          setTimeout(() => {
            if (isListening && !isProcessing) {
              console.log('🔄 Aggressive auto-restart - immediately after response');
              startListening();
            }
          }, 800);
          
          // Backup fallback timer
          const restartFallback = setTimeout(() => {
            if (isListening && !isProcessing) {
              console.log('🔄 Backup fallback restart triggered');
              startListening();
            }
          }, 1500);
          
          // Sesli cevabı oynat
          if (data.audioData) {
            try {
              console.log('🔊 Processing audio response, size:', data.audioData.length);
              
              // Audio decode
              const audioData = Uint8Array.from(atob(data.audioData), c => c.charCodeAt(0));
              console.log('🔊 Decoded audio data size:', audioData.length, 'bytes');
              
              const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
              const audioUrl = URL.createObjectURL(audioBlob);
              console.log('🔊 Created audio URL:', audioUrl);
              
              const audio = new Audio(audioUrl);
              
              audio.addEventListener('loadstart', () => {
                console.log('🔊 Audio started loading');
              });
              
              audio.addEventListener('canplay', () => {
                console.log('🔊 Audio can play');
              });
              
              audio.addEventListener('play', () => {
                console.log('🔊 Audio started playing');
              });
              
              audio.addEventListener('ended', () => {
                console.log('🔊 Audio finished playing');
                URL.revokeObjectURL(audioUrl);
                clearTimeout(restartFallback);
                // Cevap bittikten sonra tekrar dinlemeye başla
                console.log('🔊 Auto-restarting listening...');
                setTimeout(() => {
                  if (isListening && !isProcessing) {
                    console.log('🎤 Restarting continuous listening...');
                    startListening();
                  } else {
                    console.log('🎤 Cannot restart: isListening=', isListening, 'isProcessing=', isProcessing);
                  }
                }, 500);
              });
              
              audio.addEventListener('error', (error) => {
                console.error('🔊 Audio play error:', error);
                console.error('🔊 Audio error details:', audio.error);
                URL.revokeObjectURL(audioUrl);
                clearTimeout(restartFallback);
                // Ses oynatma hatası olursa da tekrar dinlemeye başla
                console.log('🔊 Audio error - restarting listening...');
                setTimeout(() => {
                  if (isListening && !isProcessing) {
                    console.log('🎤 Restarting listening after audio error...');
                    startListening();
                  }
                }, 500);
              });
              
              console.log('🔊 Starting audio playback...');
              const playPromise = audio.play();
              
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    console.log('🔊 Audio playback started successfully');
                  })
                  .catch(error => {
                    console.error('🔊 Audio playback failed:', error);
                    URL.revokeObjectURL(audioUrl);
                    clearTimeout(restartFallback);
                    // Playback başlatma hatası olursa da tekrar dinlemeye başla
                    console.log('🔊 Playback failed - restarting listening...');
                    setTimeout(() => {
                      if (isListening && !isProcessing) {
                        console.log('🎤 Restarting listening after playback error...');
                        startListening();
                      }
                    }, 500);
                  });
              }
              
            } catch (error) {
              console.error('🔊 Audio processing error:', error);
              clearTimeout(restartFallback);
              // Audio processing hatası olursa da tekrar dinlemeye başla
              setTimeout(() => {
                if (isListening && !isProcessing) {
                  console.log('🎤 Restarting listening after audio processing error...');
                  startListening();
                }
              }, 500);
            }
          } else {
            // Ses verisi yoksa direkt yeniden başla
            clearTimeout(restartFallback);
            console.log('🔊 No audio data - restarting listening...');
            setTimeout(() => {
              if (isListening && !isProcessing) {
                console.log('🎤 Restarting listening - no audio response...');
                startListening();
              }
            }, 500);
          }
        } else if (data.type === 'error') {
          setIsProcessing(false);
          console.error('Voice chat error:', data.message);
          // Hata durumunda da tekrar dinlemeye başla
          console.log('🔊 WebSocket error - restarting listening...');
          setTimeout(() => {
            if (isListening && !isProcessing) {
              console.log('🎤 Restarting listening after WebSocket error...');
              startListening();
            }
          }, 1500);
        }
      };
      
      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setIsConnected(false);
        setWebSocket(null);
        
        // 3 saniye sonra yeniden bağlanmaya çalış
        setTimeout(connectWebSocket, 3000);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };
    
    connectWebSocket();
    
    return () => {
      if (webSocket) {
        webSocket.close();
      }
    };
  }, []);

  // PCM16 Audio Streaming (Azure Speech için optimize)
  const startListening = async () => {
    if (!isConnected || !webSocket || isProcessing) return;
    
    try {
      console.log('🎤 Starting PCM16 audio streaming');
      setIsProcessing(true);
      
      // WebSocket'e kontrol mesajı gönder
      webSocket.send(JSON.stringify({ type: 'start_listening' }));
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // AudioContext oluştur
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ 
        sampleRate: 48000 
      });
      const sourceNode = audioContext.createMediaStreamSource(stream);
      
      // ScriptProcessor kullan (eski ama güvenilir)
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      
      let sampleCounter = 0;
      let totalSamples = 0;
      
      processor.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0); // mono
        
        // 48kHz -> 16kHz downsample
        const downsampled = downsampleBuffer(input, audioContext.sampleRate, 16000);
        // Float32 -> PCM16 convert  
        const pcm16 = floatTo16BitPCM(downsampled);
        
        // WebSocket ile binary data gönder
        if (webSocket && webSocket.readyState === WebSocket.OPEN) {
          webSocket.send(pcm16);
        }
        
        // Ses seviyesi monitoring (her 10 chunk'ta bir)
        totalSamples += downsampled.length;
        if (sampleCounter++ % 10 === 0) {
          const average = downsampled.reduce((a, b) => a + Math.abs(b), 0) / downsampled.length;
          console.log(`🎤 Audio Level: ${(average * 100).toFixed(1)}%, Total samples: ${totalSamples}`);
        }
      };
      
      sourceNode.connect(processor);
      processor.connect(audioContext.destination);
      
      console.log('🎤 PCM16 streaming active - talk now!');
      
      // Cleanup function'ı store et
      const cleanup = () => {
        try { 
          processor && processor.disconnect(); 
          console.log('🔄 Processor disconnected');
        } catch {}
        try { 
          sourceNode && sourceNode.disconnect(); 
          console.log('🔄 Source disconnected');
        } catch {}
        try { 
          audioContext && audioContext.close(); 
          console.log('🔄 AudioContext closed');
        } catch {}
        try { 
          stream && stream.getTracks().forEach(t => t.stop()); 
          console.log('🔄 Stream stopped');
        } catch {}
        setIsProcessing(false);
      };
      
      // Global cleanup store et
      (window as any).currentAudioCleanup = cleanup;
      
      // 10 saniye sonra otomatik dur
      setTimeout(() => {
        console.log('🎤 Auto-stopping after 10 seconds');
        cleanup();
        if (webSocket && webSocket.readyState === WebSocket.OPEN) {
          webSocket.send(JSON.stringify({ type: 'stop_listening' }));
        }
      }, 10000);
      
    } catch (error) {
      console.error('❌ Microphone access error:', error);
      setIsProcessing(false);
    }
  };

  // Audio utility functions
  const floatTo16BitPCM = (float32Array: Float32Array): Uint8Array => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return new Uint8Array(buffer);
  };

  const downsampleBuffer = (buffer: Float32Array, inSampleRate: number, outSampleRate = 16000): Float32Array => {
    if (outSampleRate === inSampleRate) return buffer;
    const sampleRateRatio = inSampleRate / outSampleRate;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Float32Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;
    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      let accum = 0, count = 0;
      for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
        accum += buffer[i];
        count++;
      }
      result[offsetResult] = accum / count;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }
    return result;
  };

  // VAD (Voice Activity Detection) fonksiyonları
  const startHandsfreeMode = useCallback(async () => {
    try {
      if (vadRef.current) {
        console.log('🎤 VAD zaten aktif');
        return;
      }

      console.log('🎤 Handsfree modu başlatılıyor...');
      setIsHandsfreeMode(true);
      setIsVADActive(true);

      // Mikrofon izni al
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      currentStreamRef.current = stream;

      // VAD instance'ı oluştur
      const vad = await MicVAD.new({
        stream,
        onSpeechStart: () => {
          console.log('🗣️ Konuşma başladı - kayıt başlatılıyor');
          if (!isProcessing && isConnected && webSocket) {
            setIsListening(true);
            startListening();
          }
        },
        onSpeechEnd: () => {
          console.log('🤐 Konuşma bitti - kayıt durduruluyor');
          if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
          setIsListening(false);
        }
      });

      vadRef.current = vad;
      vad.start();
      console.log('🎤 Handsfree modu aktif!');

    } catch (error) {
      console.error('❌ Handsfree modu başlatma hatası:', error);
      setIsHandsfreeMode(false);
      setIsVADActive(false);
    }
  }, [isProcessing, isConnected, webSocket, mediaRecorder]);

  const stopHandsfreeMode = useCallback(() => {
    try {
      console.log('🛑 Handsfree modu durduruluyor...');
      
      if (vadRef.current) {
        vadRef.current.pause();
        vadRef.current = null;
      }

      if (currentStreamRef.current) {
        currentStreamRef.current.getTracks().forEach(track => track.stop());
        currentStreamRef.current = null;
      }

      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }

      setIsHandsfreeMode(false);
      setIsVADActive(false);
      setIsListening(false);
      console.log('🛑 Handsfree modu durduruldu');
      
    } catch (error) {
      console.error('❌ Handsfree modu durdurma hatası:', error);
    }
  }, [mediaRecorder]);

  // Cleanup VAD on unmount
  useEffect(() => {
    return () => {
      if (vadRef.current) {
        vadRef.current.pause();
      }
      if (currentStreamRef.current) {
        currentStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Ana mikrofon butonu
  const toggleVoiceChat = () => {
    if (isListening) {
      // Dinlemeyi durdur
      setIsListening(false);
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    } else {
      // Dinlemeye başla
      setIsListening(true);
      startListening();
    }
  };


  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <SidebarProvider>
      <NewSidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/dashboard">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Bot className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Azure AI Platform</span>
                    <span className="truncate text-xs">AI Assistant</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title} isActive={item.isActive} asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <Popover>
                <PopoverTrigger asChild>
                  <SidebarMenuButton size="lg" className="cursor-pointer">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {getInitials(user?.firstName || undefined, user?.lastName || undefined) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user?.firstName || "Kullanıcı"}</span>
                      <span className="truncate text-xs">{user?.primaryEmailAddress?.emailAddress}</span>
                    </div>
                  </SidebarMenuButton>
                </PopoverTrigger>
                <PopoverContent className='w-64' align="start">
                  <PopoverHeader>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {getInitials(user?.firstName || undefined, user?.lastName || undefined) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <PopoverTitle>{user?.firstName || "Kullanıcı"} {user?.lastName || ""}</PopoverTitle>
                        <PopoverDescription className='text-xs'>{user?.primaryEmailAddress?.emailAddress}</PopoverDescription>
                      </div>
                    </div>
                  </PopoverHeader>
                  <PopoverBody className="space-y-1 px-2 py-1">
                    <Button variant="ghost" className="w-full justify-start" size="sm" asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        View Profile
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="sm" asChild>
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" size="sm" asChild>
                      <Link href="/subscription">
                        <Crown className="mr-2 h-4 w-4" />
                        Planım
                      </Link>
                    </Button>
                  </PopoverBody>
                  <PopoverFooter>
                    <Button variant="outline" className="w-full bg-transparent" size="sm" onClick={() => signOut()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </PopoverFooter>
                </PopoverContent>
              </Popover>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </NewSidebar>
      <SidebarInset>
        {/* Sidebar Trigger - Floating over content */}
        <div className="absolute top-4 left-4 z-20">
          <SidebarTrigger className="bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background/90" />
        </div>
        
        {/* Voice Assistant Content - Full Screen */}
        <div className="relative w-full h-screen overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 z-0">
            <AnoAI />
          </div>
          
          {/* Siri Orb and Voice Input overlay */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
            <SiriOrb
              size="256px"
              animationDuration={15}
              className="drop-shadow-2xl"
            />
            
            {/* Voice Chat Toggle Button in center of Siri Orb */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={toggleVoiceChat}
                disabled={!isConnected || isHandsfreeMode}
                className={`
                  transition-all duration-200
                  ${!isConnected || isHandsfreeMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
                  flex items-center justify-center
                `}
              >
                <Mic 
                  className={`
                    w-6 h-6 transition-all duration-200
                    ${!isConnected ? 'text-gray-500' :
                      isProcessing ? 'text-yellow-400 animate-pulse scale-125' :
                      isListening ? 'text-green-400 animate-pulse scale-125' : 'text-white/80'}
                  `} 
                />
              </button>
            </div>
            
            {/* Handsfree Control Panel */}
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20">
              <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="flex items-center space-x-4">
                  {/* Handsfree Toggle */}
                  <button
                    onClick={() => isHandsfreeMode ? stopHandsfreeMode() : startHandsfreeMode()}
                    disabled={!isConnected}
                    className={`
                      px-4 py-2 rounded-xl transition-all duration-200 font-medium text-sm
                      flex items-center space-x-2
                      ${!isConnected ? 'opacity-50 cursor-not-allowed bg-gray-600' :
                        isHandsfreeMode ? 'bg-green-500 hover:bg-green-600 text-white' : 
                        'bg-blue-500 hover:bg-blue-600 text-white'}
                    `}
                  >
                    <Mic className="w-4 h-4" />
                    <span>{isHandsfreeMode ? 'Handsfree Aktif' : 'Handsfree Başlat'}</span>
                  </button>
                  
                  {/* Status indicator */}
                  <div className="flex items-center space-x-2 text-xs text-white/80">
                    <div className={`w-2 h-2 rounded-full ${
                      !isConnected ? 'bg-red-400' :
                      isHandsfreeMode ? 'bg-green-400 animate-pulse' :
                      isListening ? 'bg-blue-400 animate-pulse' :
                      'bg-gray-400'
                    }`} />
                    <span>
                      {!isConnected ? 'Bağlantısız' :
                       isHandsfreeMode ? 'Handsfree Aktif' :
                       isListening ? 'Dinliyor' :
                       'Hazır'}
                    </span>
                  </div>
                </div>
                
                {/* Instructions */}
                <div className="mt-2 text-xs text-white/60 text-center">
                  {isHandsfreeMode ? 
                    'Konuşmaya başlayın, sistem otomatik algılayacak' :
                    'Handsfree modu için butona tıklayın veya manuel mikrofon kullanın'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

