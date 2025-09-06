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
  const [partialTranscript, setPartialTranscript] = useState<string>('');
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
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
        console.log('📩 WebSocket message received:', data.type);
        
        switch (data.type) {
          case 'stream_ready':
            console.log('✅ Stream ready:', data.message);
            setIsProcessing(true);
            break;
            
          case 'partial_transcript':
            console.log('📋 Partial transcript:', data.text);
            setPartialTranscript(data.text);
            break;
            
          case 'final_transcript':
            console.log('✅ Final transcript:', data.text);
            setFinalTranscript(data.text);
            setPartialTranscript('');
            setIsGeneratingResponse(true);
            break;
            
          case 'llm_reply':
            console.log('🤖 AI Response:', data.text);
            setAiResponse(data.text);
            setIsGeneratingResponse(false);
            break;
            
          case 'tts_audio':
            console.log('🔊 Received TTS audio:', data.format);
            setIsSpeaking(true);
            playOptimizedAudio(data.base64, data.format);
            break;
            
          case 'info':
            console.log('ℹ️ Info:', data.message);
            // Session is ready for next interaction
            setIsProcessing(false);
            setTimeout(() => {
              if (isListening) {
                console.log('🔄 Restarting after info message');
                startOptimizedListening();
              }
            }, 1000);
            break;
            
          case 'error':
            console.error('❌ Error:', data.error);
            setIsProcessing(false);
            setIsGeneratingResponse(false);
            setIsSpeaking(false);
            // Restart listening after error
            setTimeout(() => {
              if (isListening) {
                console.log('🔄 Restarting after error');
                startOptimizedListening();
              }
            }, 2000);
            break;
            
          default:
            console.log('❓ Unknown message type:', data.type);
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

  // Optimize edilmiş PCM16 Audio Streaming
  const startOptimizedListening = async () => {
    if (!isConnected || !webSocket || isProcessing) return;
    
    try {
      console.log('🎤 Starting optimized PCM16 audio streaming');
      
      // Clear previous states
      setPartialTranscript('');
      setFinalTranscript('');
      setAiResponse('');
      setIsGeneratingResponse(false);
      setIsSpeaking(false);
      
      // WebSocket'e kontrol mesajı gönder
      webSocket.send(JSON.stringify({ type: 'start_listening' }));
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1
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
        
        // Minimal monitoring
        if (sampleCounter++ % 20 === 0) {
          const average = downsampled.reduce((a, b) => a + Math.abs(b), 0) / downsampled.length;
          console.log(`🎤 Audio Level: ${(average * 100).toFixed(1)}%`);
        }
      };
      
      sourceNode.connect(processor);
      processor.connect(audioContext.destination);
      
      console.log('🎤 Optimized PCM16 streaming active!');
      
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
      };
      
      // Global cleanup store et
      (window as any).currentOptimizedCleanup = cleanup;
      
      // 8 saniye sonra otomatik dur (daha kısa session)
      setTimeout(() => {
        console.log('🎤 Auto-stopping after 8 seconds');
        cleanup();
        if (webSocket && webSocket.readyState === WebSocket.OPEN) {
          webSocket.send(JSON.stringify({ type: 'stop_listening' }));
        }
      }, 8000);
      
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
            startOptimizedListening();
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

  // Optimize edilmiş audio playback
  const playOptimizedAudio = async (base64Audio: string, format: string) => {
    try {
      // Base64'ü blob'a dönüştür
      const audioData = atob(base64Audio);
      const audioArray = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        audioArray[i] = audioData.charCodeAt(i);
      }
      
      const mimeType = format === 'mp3' ? 'audio/mpeg' : 'audio/wav';
      const audioBlob = new Blob([audioArray], { type: mimeType });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        console.log('🔊 Audio finished - ready for next interaction');
        
        // Auto-restart listening after audio ends
        setTimeout(() => {
          if (isListening) {
            console.log('🔄 Auto-restarting listening after audio');
            startOptimizedListening();
          }
        }, 1000);
      };
      
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        console.error('❌ Audio playback error');
        
        // Restart even on error
        setTimeout(() => {
          if (isListening) {
            console.log('🔄 Restarting after audio error');
            startOptimizedListening();
          }
        }, 1500);
      };
      
      await audio.play();
      console.log('🔊 Playing optimized audio response');
      
    } catch (err) {
      setIsSpeaking(false);
      console.error('❌ Audio processing error:', err);
      
      // Restart on processing error
      setTimeout(() => {
        if (isListening) {
          console.log('🔄 Restarting after processing error');
          startOptimizedListening();
        }
      }, 1500);
    }
  };

  // Ana mikrofon butonu - Optimize edilmiş
  const toggleOptimizedVoiceChat = () => {
    if (isListening) {
      // Dinlemeyi durdur
      setIsListening(false);
      setIsProcessing(false);
      setIsGeneratingResponse(false);
      setIsSpeaking(false);
      
      // Cleanup current session
      if ((window as any).currentOptimizedCleanup) {
        (window as any).currentOptimizedCleanup();
      }
      
      if (webSocket && webSocket.readyState === WebSocket.OPEN) {
        webSocket.send(JSON.stringify({ type: 'stop_listening' }));
      }
    } else {
      // Dinlemeye başla
      setIsListening(true);
      startOptimizedListening();
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
                onClick={toggleOptimizedVoiceChat}
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
            
            {/* Optimize edilmiş Real-time Status Panel */}
            {(partialTranscript || finalTranscript || aiResponse || isGeneratingResponse || isSpeaking) && (
              <div className="absolute bottom-44 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-md px-4">
                <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-3">
                  
                  {partialTranscript && (
                    <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg p-3 border border-blue-400/30">
                      <p className="text-xs font-medium text-blue-200 mb-1">Dinleniyor...</p>
                      <p className="text-sm text-blue-100">{partialTranscript}</p>
                    </div>
                  )}
                  
                  {finalTranscript && (
                    <div className="bg-green-500/20 backdrop-blur-sm rounded-lg p-3 border border-green-400/30">
                      <p className="text-xs font-medium text-green-200 mb-1">Siz:</p>
                      <p className="text-sm text-green-100">{finalTranscript}</p>
                    </div>
                  )}
                  
                  {isGeneratingResponse && (
                    <div className="bg-yellow-500/20 backdrop-blur-sm rounded-lg p-3 border border-yellow-400/30">
                      <p className="text-sm font-medium text-yellow-200 flex items-center">
                        <span className="animate-spin mr-2">🤖</span>
                        AI yanıt üretiyor...
                      </p>
                    </div>
                  )}
                  
                  {aiResponse && (
                    <div className="bg-purple-500/20 backdrop-blur-sm rounded-lg p-3 border border-purple-400/30">
                      <p className="text-xs font-medium text-purple-200 mb-1">AI:</p>
                      <p className="text-sm text-purple-100">{aiResponse}</p>
                    </div>
                  )}
                  
                  {isSpeaking && (
                    <div className="bg-orange-500/20 backdrop-blur-sm rounded-lg p-3 border border-orange-400/30">
                      <p className="text-sm font-medium text-orange-200 flex items-center">
                        <span className="animate-pulse mr-2">🔊</span>
                        Sesli yanıt oynuyor...
                      </p>
                    </div>
                  )}
                  
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

