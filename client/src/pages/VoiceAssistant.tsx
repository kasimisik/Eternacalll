"use client";
import React, { useState, useEffect } from "react";
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
        
        if (data.type === 'response') {
          setIsProcessing(false);
          
          // Sesli cevabı oynat
          if (data.audioData) {
            try {
              const audioData = Uint8Array.from(atob(data.audioData), c => c.charCodeAt(0));
              const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
              const audioUrl = URL.createObjectURL(audioBlob);
              
              const audio = new Audio(audioUrl);
              audio.play();
              
              audio.addEventListener('ended', () => {
                URL.revokeObjectURL(audioUrl);
                // Cevap bittikten sonra tekrar dinlemeye başla
                setTimeout(() => {
                  if (isListening && !isProcessing) {
                    startListening();
                  }
                }, 500);
              });
            } catch (error) {
              console.error('Audio play error:', error);
            }
          }
        } else if (data.type === 'error') {
          setIsProcessing(false);
          console.error('Voice chat error:', data.message);
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

  // Sürekli ses dinleme
  const startListening = async () => {
    if (!isConnected || !webSocket || isProcessing) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      const recorder = new MediaRecorder(stream, { 
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 16000
      });
      
      const audioChunks: Blob[] = [];
      let silenceTimer: NodeJS.Timeout | null = null;
      
      // Sessizlik algılama için AudioContext
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      microphone.connect(analyser);
      analyser.fftSize = 256;
      
      const checkForSilence = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        
        if (average < 10) { // Sessizlik threshold
          if (!silenceTimer) {
            silenceTimer = setTimeout(() => {
              if (audioChunks.length > 0) {
                recorder.stop();
              }
            }, 1500); // 1.5 saniye sessizlik sonrası dur
          }
        } else {
          if (silenceTimer) {
            clearTimeout(silenceTimer);
            silenceTimer = null;
          }
        }
        
        if (recorder.state === 'recording') {
          requestAnimationFrame(checkForSilence);
        }
      };
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      
      recorder.onstop = async () => {
        if (silenceTimer) {
          clearTimeout(silenceTimer);
        }
        
        audioContext.close();
        stream.getTracks().forEach(track => track.stop());
        
        if (audioChunks.length > 0) {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          
          setIsProcessing(true);
          
          // Blob'u base64'e çevir
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Audio = (reader.result as string).split(',')[1];
            
            if (webSocket && webSocket.readyState === WebSocket.OPEN) {
              webSocket.send(JSON.stringify({
                type: 'audio',
                audioData: base64Audio
              }));
            }
          };
          reader.readAsDataURL(audioBlob);
        }
        
        setMediaRecorder(null);
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      checkForSilence();
      
    } catch (error) {
      console.error('Microphone access error:', error);
    }
  };

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
                disabled={!isConnected}
                className={`
                  transition-all duration-200
                  ${!isConnected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
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
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

