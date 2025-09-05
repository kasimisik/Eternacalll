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
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useUserHook, useAuthHook } from '@/lib/auth-hook';
import { Card, CardContent } from '@/components/ui/card';
import PaymentButton from '@/components/PaymentButton';
import { VercelV0Chat } from '@/components/ui/v0-ai-chat';
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
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Dashboard() {
  const { user } = useUserHook();
  const { signOut } = useAuthHook();
  const [subscription, setSubscription] = useState<{
    hasSubscription: boolean;
    plan: string;
    email?: string;
    createdAt?: string;
  } | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  const data = {
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
        isActive: true,
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
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 justify-between">
          <SidebarTrigger className="-ml-1" />
          <PremiumButton 
            subscription={subscription}
            loadingSubscription={loadingSubscription}
          />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-0 pt-0">
          <DashboardContent 
            subscription={subscription}
            loadingSubscription={loadingSubscription}
            user={user}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}


// Premium Button component for top-right corner
const PremiumButton = ({ 
  subscription, 
  loadingSubscription 
}: {
  subscription: any;
  loadingSubscription: boolean;
}) => {
  const [showPricingModal, setShowPricingModal] = useState(false);

  // Don't show if loading or user has subscription
  if (loadingSubscription || subscription?.hasSubscription) {
    return null;
  }

  return (
    <>
      <RainbowButton 
        onClick={() => setShowPricingModal(true)}
        className="text-sm px-4 py-2 h-9"
      >
        🚀 Premium Özellikleri Aç
      </RainbowButton>
      
      <ModalPricing
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
      />
    </>
  );
};

// Dashboard content component
const DashboardContent = ({ 
  subscription, 
  loadingSubscription, 
  user
}: {
  subscription: any;
  loadingSubscription: boolean;
  user: any;
}) => {
  return (
    <div className="flex flex-1 h-full max-h-[calc(100vh-4rem)] overflow-hidden w-full">
      <VercelV0Chat />
    </div>
  );
};