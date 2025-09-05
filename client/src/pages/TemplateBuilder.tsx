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
import { LayoutDashboard, UserCog, Settings, LogOut, Bot, Crown, FileText, Mic, Play, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useUserHook, useAuthHook } from '@/lib/auth-hook';
import { ShaderAnimation } from "@/components/ui/shader-animation";
import { TextShimmerWave } from "@/components/ui/text-shimmer-wave";
import { Button } from "@/components/ui/button";
import { RainbowButton } from '@/components/ui/rainbow-button';
import { ModalPricing } from '@/components/ui/modal-pricing';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function TemplateBuilder() {
  const { user } = useUserHook();
  const { signOut } = useAuthHook();
  const [, setLocation] = useLocation();
  const [subscription, setSubscription] = useState<{
    hasSubscription: boolean;
    plan: string;
    email?: string;
    createdAt?: string;
  } | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  
  // URL'den template bilgilerini al (query params)
  const urlParams = new URLSearchParams(window.location.search);
  const templateTitle = urlParams.get('title') || 'AI Asistanı';
  const templateColor = urlParams.get('color') || '#3b82f6';

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

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <SidebarProvider defaultOpen={true}>
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
                        <UserCog className="mr-2 h-4 w-4" />
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
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-0 pt-0">
          {/* Template Builder Content - Full Width */}
          <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden">
            {/* Shader Animation Background */}
            <div className="absolute inset-0 z-0">
              <ShaderAnimation />
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 h-full flex flex-col">
              {/* Main Content */}
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                {/* Animated Title */}
                <div className="mb-8">
                  <TextShimmerWave
                    className="text-4xl md:text-6xl lg:text-7xl font-bold text-white [--base-color:#ffffff] [--base-gradient-color:#60a5fa]"
                    duration={1.5}
                    spread={0.8}
                    zDistance={15}
                    scaleDistance={1.2}
                    rotateYDistance={25}
                  >
                    {templateTitle}
                  </TextShimmerWave>
                </div>

                {/* Subtitle */}
                <p className="text-lg md:text-xl text-white/80 mb-12 max-w-2xl leading-relaxed">
                  Kişiselleştirilmiş AI asistanınızı oluşturmaya başlayın. 
                  Güçlü Azure AI teknolojisi ile mükemmel deneyim.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg"
                    className="bg-white text-black hover:bg-white/90 backdrop-blur-sm px-8 py-4 text-lg font-semibold"
                    onClick={() => setLocation('/dashboard')}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Şimdi Başla
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-white text-white hover:bg-white/10 backdrop-blur-sm px-8 py-4 text-lg"
                    onClick={() => setLocation('/templates')}
                  >
                    Diğer Şablonları Gör
                  </Button>
                </div>
              </div>

              {/* Footer */}
              <footer className="p-6 text-center">
                <p className="text-white/60 text-sm">
                  Azure AI ile asistanınızı dakikalar içinde oluşturun
                </p>
              </footer>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

