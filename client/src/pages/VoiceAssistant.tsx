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
  const [voiceStatus, setVoiceStatus] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

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

  // Sesli konuşma işlemi
  const handleVoiceRecording = async (duration: number, audioBlob?: Blob) => {
    if (!audioBlob) {
      setVoiceStatus('Ses kaydı alınamadı');
      return;
    }

    if (isProcessing) {
      setVoiceStatus('Zaten bir ses işleniyor, lütfen bekleyin...');
      return;
    }

    setIsProcessing(true);
    setVoiceStatus('Sesiniz işleniyor...');

    try {
      // FormData oluştur
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice-recording.webm');
      formData.append('sessionId', `user_${user?.id}` || 'guest');

      console.log('🎤 Sending voice recording to server...');

      // Tam sesli konuşma API'sine gönder
      const response = await fetch('/api/voice/conversation', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setVoiceStatus(`AI: ${result.aiResponse || 'Cevap alındı'}`);
        
        // Gelen ses verisini oynat
        if (result.audioData) {
          try {
            const audioData = Uint8Array.from(atob(result.audioData), c => c.charCodeAt(0));
            const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(audioBlob);
            
            const audio = new Audio(audioUrl);
            audio.play().then(() => {
              console.log('✅ AI response audio playing');
            }).catch(err => {
              console.error('Audio play error:', err);
              setVoiceStatus('Ses çalınamadı ama metin cevap alındı');
            });
            
            // Cleanup
            audio.addEventListener('ended', () => {
              URL.revokeObjectURL(audioUrl);
              setTimeout(() => setVoiceStatus(''), 5000);
            });
          } catch (audioError) {
            console.error('Audio processing error:', audioError);
            setTimeout(() => setVoiceStatus(''), 5000);
          }
        } else {
          setTimeout(() => setVoiceStatus(''), 5000);
        }
      } else {
        setVoiceStatus(`Hata: ${result.message || 'Bilinmeyen hata'}`);
        setTimeout(() => setVoiceStatus(''), 5000);
      }

    } catch (error) {
      console.error('Voice conversation error:', error);
      setVoiceStatus('Bağlantı hatası. Lütfen tekrar deneyin.');
      setTimeout(() => setVoiceStatus(''), 5000);
    } finally {
      setIsProcessing(false);
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
            
            {/* AI Voice Input below Siri Orb */}
            <div className="mt-8">
              <AIVoiceInput 
                onStart={() => console.log('Voice recording started')}
                onStop={handleVoiceRecording}
                visualizerBars={48}
                className="text-white"
              />
            </div>
            
            {/* Voice Status Display */}
            {voiceStatus && (
              <div className="mt-4 text-center text-white bg-black/30 backdrop-blur-sm rounded-lg p-4 max-w-md">
                <p className="text-sm opacity-80">{voiceStatus}</p>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

