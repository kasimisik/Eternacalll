import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { LayoutDashboard, UserCog, Settings, LogOut, Bot, Crown, CreditCard } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useUserHook, useAuthHook } from '@/lib/auth-hook';
import { Card, CardContent } from '@/components/ui/card';
import PaymentButton from '@/components/PaymentButton';

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

  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Profile",
      href: "/profile",
      icon: (
        <UserCog className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Settings",
      href: "/settings",
      icon: (
        <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Planım",
      href: "/subscription",
      icon: (
        <Crown className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Logout",
      href: "#",
      icon: (
        <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  const [open, setOpen] = useState(false);

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
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-neutral-900 dark:bg-neutral-900 w-full flex-1 min-h-screen mx-auto border border-neutral-700 dark:border-neutral-700 overflow-hidden"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => {
                if (link.label === "Logout") {
                  return (
                    <div 
                      key={idx}
                      onClick={() => signOut()}
                      className="flex items-center justify-start gap-2 group/sidebar py-2 cursor-pointer"
                    >
                      {link.icon}
                      <motion.span
                        animate={{
                          display: open ? "inline-block" : "none",
                          opacity: open ? 1 : 0,
                        }}
                        className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
                      >
                        {link.label}
                      </motion.span>
                    </div>
                  );
                }
                return <SidebarLink key={idx} link={link} />;
              })}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: user?.firstName || "Kullanıcı",
                href: "#",
                icon: (
                  <div className="h-7 w-7 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
                    {getInitials(user?.firstName || undefined, user?.lastName || undefined) || 'U'}
                  </div>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <SubscriptionContent 
        subscription={subscription}
        loadingSubscription={loadingSubscription}
        user={user}
      />
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      href="/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <Bot className="h-6 w-6 text-primary flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        Azure AI Platform
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <Bot className="h-6 w-6 text-primary flex-shrink-0" />
    </Link>
  );
};

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
    <div className="flex flex-1">
      {/* Main Content Area - Subscription Management */}
      <div className="flex-1 p-4 md:p-8 rounded-tl-2xl border border-neutral-700 dark:border-neutral-700 bg-neutral-900 dark:bg-neutral-900">
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