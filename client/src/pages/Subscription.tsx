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
import { LayoutDashboard, UserCog, Settings, LogOut, Bot, Crown, CreditCard, FileText, Mic, User } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useUserHook, useAuthHook } from '@/lib/auth-hook';
import { Card, CardContent } from '@/components/ui/card';
import PaymentButton from '@/components/PaymentButton';
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

export default function Subscription() {
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
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="ml-auto px-3">
            <h1 className="text-lg font-semibold">Planım</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <SubscriptionContent 
            subscription={subscription}
            loadingSubscription={loadingSubscription}
            user={user}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Subscription content component
const SubscriptionContent = ({ 
  subscription, 
  loadingSubscription, 
  user
}: {
  subscription: any;
  loadingSubscription: boolean;
  user: any;
}) => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 rounded-xl bg-muted/50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8">Planım</h1>
          
          {/* Current Plan Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {!loadingSubscription && (
              <Card className={`${
                subscription?.hasSubscription 
                  ? 'border-green-200 bg-green-50 dark:bg-green-900/20' 
                  : 'border-amber-200 bg-amber-50 dark:bg-amber-900/20'
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-xl font-bold ${
                      subscription?.hasSubscription ? 'text-green-800 dark:text-green-200' : 'text-amber-800 dark:text-amber-200'
                    }`}>
                      {subscription?.hasSubscription ? subscription.plan : 'Ücretsiz Plan'}
                    </h2>
                    {subscription?.hasSubscription ? (
                      <Crown className="w-6 h-6 text-yellow-600" />
                    ) : (
                      <CreditCard className="w-6 h-6 text-amber-600" />
                    )}
                  </div>
                  <p className={`text-sm mb-4 ${
                    subscription?.hasSubscription ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'
                  }`}>
                    Hoş geldiniz, {user?.firstName || 'Kullanıcı'}!
                  </p>
                  
                  {subscription?.hasSubscription ? (
                    <div className="space-y-2">
                      <p className="text-sm text-green-600 dark:text-green-400">✓ Aktif abonelik</p>
                      <p className="text-sm text-green-600 dark:text-green-400">✓ Tüm özellikler açık</p>
                      <p className="text-sm text-green-600 dark:text-green-400">✓ Premium destek</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-amber-600 dark:text-amber-400">⚠ Sınırlı özellikler</p>
                      <p className="text-sm text-amber-600 dark:text-amber-400">⚠ Temel destek</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Account Info */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Hesap Bilgileri</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">İsim</p>
                    <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">E-posta</p>
                    <p className="font-medium">{user?.emailAddresses?.[0]?.emailAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hesap ID</p>
                    <p className="font-mono text-xs text-muted-foreground">{user?.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upgrade Section - Only show for non-subscribers */}
          {!loadingSubscription && !subscription?.hasSubscription && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Profesyonel Plana Geçin</h2>
              <Card className="border-primary">
                <CardContent className="p-8">
                  <div className="text-center">
                    <Crown className="w-16 h-16 text-yellow-600 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-foreground mb-4">Profesyonel Plan</h3>
                    <p className="text-muted-foreground mb-6 text-lg">
                      Tüm özelliklere tam erişim kazanın
                    </p>
                    <div className="text-4xl font-bold text-primary mb-8">₺60<span className="text-lg text-muted-foreground">/ay</span></div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
                      <div>
                        <h4 className="font-semibold mb-3">Temel Özellikler</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>✓ Sınırsız AI ajanları</li>
                          <li>✓ Azure ses sentezi</li>
                          <li>✓ Özel telefon endpoint'leri</li>
                          <li>✓ Gelişmiş ses ayarları</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">Premium Özellikler</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>✓ 7/24 Premium destek</li>
                          <li>✓ API integrasyon desteği</li>
                          <li>✓ Özel raporlama</li>
                          <li>✓ Öncelikli güncelleme</li>
                        </ul>
                      </div>
                    </div>
                    
                    <PaymentButton />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Features Overview */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Platform Özellikleri</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-blue-50 dark:bg-blue-900/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Bot className="w-8 h-8 text-blue-600" />
                    <h3 className="font-bold text-blue-800 dark:text-blue-200">AI Asistan</h3>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Azure AI ile güçlendirilmiş gelişmiş yapay zeka asistanı. Doğal dil işleme ve akıllı yanıtlar.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 dark:bg-purple-900/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg">📞</span>
                    </div>
                    <h3 className="font-bold text-purple-800 dark:text-purple-200">Telefon API</h3>
                  </div>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    SIP protokolü ile entegre telefon sistemi. Sesli arama ve gerçek zamanlı iletişim.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-green-50 dark:bg-green-900/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-green-600 rounded-full"></div>
                    <h3 className="font-bold text-green-800 dark:text-green-200">7/24 Aktif</h3>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Kesintisiz hizmet garantisi. %99.9 uptime ve güvenilir altyapı ile sürekli erişim.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};