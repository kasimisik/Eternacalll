"use client";
import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { LayoutDashboard, UserCog, Settings, LogOut, Bot, Crown, CreditCard } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useUserHook, useAuthHook } from '@/lib/auth-hook';
import { Card, CardContent } from '@/components/ui/card';
import { VoiceAssistantModal, VoiceAssistantTrigger } from '@/components/VoiceAssistantModal';
import PaymentButton from '@/components/PaymentButton';

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
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);

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
        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 min-h-screen mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden"
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
      <DashboardContent 
        subscription={subscription}
        loadingSubscription={loadingSubscription}
        user={user}
        showVoiceAssistant={showVoiceAssistant}
        setShowVoiceAssistant={setShowVoiceAssistant}
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

// Dashboard content component
const DashboardContent = ({ 
  subscription, 
  loadingSubscription, 
  user, 
  showVoiceAssistant, 
  setShowVoiceAssistant 
}: {
  subscription: any;
  loadingSubscription: boolean;
  user: any;
  showVoiceAssistant: boolean;
  setShowVoiceAssistant: (show: boolean) => void;
}) => {
  return (
    <div className="flex flex-1">
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-6 flex-1 w-full h-full overflow-y-auto">
        
        {/* Abonelik Durumu Kartları */}
        {!loadingSubscription && (
          <div className="flex gap-2">
            <div className={`h-20 w-full rounded-lg p-4 flex items-center justify-between ${
              subscription?.hasSubscription 
                ? 'bg-green-100 dark:bg-green-900' 
                : 'bg-amber-100 dark:bg-amber-900'
            }`}>
              <div>
                <h3 className={`font-semibold text-sm ${
                  subscription?.hasSubscription ? 'text-green-800 dark:text-green-200' : 'text-amber-800 dark:text-amber-200'
                }`}>
                  Hoş geldiniz, {user?.firstName || 'Kullanıcı'}!
                </h3>
                <p className={`text-xs ${
                  subscription?.hasSubscription ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'
                }`}>
                  {subscription?.hasSubscription 
                    ? `${subscription.plan} aktif`
                    : 'Ücretsiz plan'
                  }
                </p>
              </div>
              {subscription?.hasSubscription ? (
                <Crown className="w-6 h-6 text-yellow-600" />
              ) : (
                <CreditCard className="w-6 h-6 text-amber-600" />
              )}
            </div>
            <div className="h-20 w-full rounded-lg bg-blue-100 dark:bg-blue-900 p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-blue-800 dark:text-blue-200">AI Asistan</h3>
                <p className="text-xs text-blue-700 dark:text-blue-300">Azure Destekli</p>
              </div>
              <Bot className="w-6 h-6 text-blue-600" />
            </div>
            <div className="h-20 w-full rounded-lg bg-purple-100 dark:bg-purple-900 p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-purple-800 dark:text-purple-200">Telefon API</h3>
                <p className="text-xs text-purple-700 dark:text-purple-300">SIP Entegrasyonu</p>
              </div>
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">📞</span>
              </div>
            </div>
            <div className="h-20 w-full rounded-lg bg-gray-100 dark:bg-neutral-800 animate-pulse"></div>
          </div>
        )}

        {/* Ana İçerik Alanı */}
        <div className="flex gap-2 flex-1">
          {/* Sol Kolon - Ödeme ve Voice Assistant */}
          <div className="h-full w-full rounded-lg bg-white dark:bg-neutral-800 p-6 border border-neutral-200 dark:border-neutral-700">
            
            {/* Ödeme Seçenekleri - Sadece aboneliği olmayanlara göster */}
            {!loadingSubscription && !subscription?.hasSubscription && (
              <Card className="mb-6 border-primary">
                <CardContent className="p-4">
                  <div className="text-center">
                    <Crown className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-foreground mb-2">Profesyonel Plana Yükselt</h3>
                    <p className="text-muted-foreground mb-3 text-sm">
                      Tüm Voice Agent özelliklerine erişim
                    </p>
                    <div className="text-2xl font-bold text-primary mb-3">₺60/ay</div>
                    <ul className="text-xs text-muted-foreground space-y-1 mb-4">
                      <li>✓ Sınırsız AI ajanları</li>
                      <li>✓ Azure ses sentezi</li>
                      <li>✓ Özel telefon endpoint'leri</li>
                      <li>✓ Gelişmiş ses ayarları</li>
                    </ul>
                    <PaymentButton />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SIP Voice Agent Info */}
            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-950 dark:via-purple-950 dark:to-indigo-950 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  📞 Azure SIP Telefon Asistanı
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Azure Speech ve Anthropic AI ile güçlendirilmiş
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Azure Speech
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Claude AI
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Text-to-Speech
                  </div>
                </div>
              </div>
              
              <VoiceAssistantTrigger onOpen={() => setShowVoiceAssistant(true)} />
              
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                ✨ Mikrofona tıklayın ve Azure AI ile konuşun
              </div>
            </div>
          </div>

          {/* Sağ Kolon - İstatistikler ve Dashboard */}
          <div className="h-full w-full rounded-lg bg-white dark:bg-neutral-800 p-6 border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-semibold text-foreground mb-4">Sistem Durumu</h3>
            
            {/* İstatistik Kartları */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">100%</div>
                <div className="text-xs text-blue-500 dark:text-blue-300">Sistem Çalışma</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">24/7</div>
                <div className="text-xs text-green-500 dark:text-green-300">Aktif Destek</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">AI</div>
                <div className="text-xs text-purple-500 dark:text-purple-300">Voice Engine</div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">SIP</div>
                <div className="text-xs text-orange-500 dark:text-orange-300">Telefon API</div>
              </div>
            </div>

            {/* Aktivite Grafiği Simülasyonu */}
            <div className="bg-gray-50 dark:bg-neutral-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-foreground mb-3">Son 7 Gün Aktivite</h4>
              <div className="flex items-end gap-1 h-16">
                {[30, 50, 40, 60, 45, 70, 55].map((height, i) => (
                  <div 
                    key={i}
                    className="bg-primary rounded-t flex-1"
                    style={{ height: `${height}%` }}
                  ></div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Pzt</span>
                <span>Sal</span>
                <span>Çar</span>
                <span>Per</span>
                <span>Cum</span>
                <span>Cmt</span>
                <span>Paz</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Voice Assistant Modal */}
      <VoiceAssistantModal 
        isOpen={showVoiceAssistant} 
        onClose={() => setShowVoiceAssistant(false)} 
      />
    </div>
  );
};