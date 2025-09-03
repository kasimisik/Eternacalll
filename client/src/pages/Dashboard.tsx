"use client";
import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { LayoutDashboard, UserCog, Settings, LogOut, Bot, Crown, CreditCard } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useUserHook, useAuthHook } from '@/lib/auth-hook';
import { Card, CardContent } from '@/components/ui/card';
import PaymentButton from '@/components/PaymentButton';
import { VercelV0Chat } from '@/components/ui/v0-ai-chat';

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
  user
}: {
  subscription: any;
  loadingSubscription: boolean;
  user: any;
}) => {
  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      {/* Main Content Area - V0 Chat Component */}
      <div className="flex-1 p-4 md:p-8 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex items-center justify-center min-h-screen">
        <VercelV0Chat />
      </div>
      
      {/* Right Sidebar - Subscription Panel */}
      <div className="w-full lg:w-80 xl:w-96 p-4 md:p-6 bg-gray-50 dark:bg-neutral-800 border-l border-neutral-200 dark:border-neutral-700 flex flex-col gap-4">
        <h2 className="text-xl font-bold text-foreground mb-4">Planım</h2>
        
        {/* Current Plan Status */}
        {!loadingSubscription && (
          <div className={`rounded-lg p-4 ${
            subscription?.hasSubscription 
              ? 'bg-green-100 dark:bg-green-900' 
              : 'bg-amber-100 dark:bg-amber-900'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className={`font-semibold ${
                subscription?.hasSubscription ? 'text-green-800 dark:text-green-200' : 'text-amber-800 dark:text-amber-200'
              }`}>
                {subscription?.hasSubscription ? subscription.plan : 'Ücretsiz Plan'}
              </h3>
              {subscription?.hasSubscription ? (
                <Crown className="w-5 h-5 text-yellow-600" />
              ) : (
                <CreditCard className="w-5 h-5 text-amber-600" />
              )}
            </div>
            <p className={`text-sm ${
              subscription?.hasSubscription ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'
            }`}>
              Hoş geldiniz, {user?.firstName || 'Kullanıcı'}!
            </p>
          </div>
        )}

        {/* Upgrade Card - Only show for non-subscribers */}
        {!loadingSubscription && !subscription?.hasSubscription && (
          <Card className="border-primary">
            <CardContent className="p-4">
              <div className="text-center">
                <Crown className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-foreground mb-2">Profesyonel Plan</h3>
                <p className="text-muted-foreground mb-3 text-sm">
                  Tüm özelliklere erişim
                </p>
                <div className="text-2xl font-bold text-primary mb-3">₺60/ay</div>
                <ul className="text-xs text-muted-foreground space-y-1 mb-4 text-left">
                  <li>✓ Sınırsız AI ajanları</li>
                  <li>✓ Azure ses sentezi</li>
                  <li>✓ Özel telefon endpoint'leri</li>
                  <li>✓ Gelişmiş ses ayarları</li>
                  <li>✓ Premium destek</li>
                </ul>
                <PaymentButton />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features Overview */}
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground">Platform Özellikleri</h4>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800 dark:text-blue-200 text-sm">AI Asistan</span>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300">Azure AI ile güçlendirilmiş</p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">📞</span>
              </div>
              <span className="font-medium text-purple-800 dark:text-purple-200 text-sm">Telefon API</span>
            </div>
            <p className="text-xs text-purple-700 dark:text-purple-300">SIP entegrasyonu</p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-green-600 rounded-full"></div>
              <span className="font-medium text-green-800 dark:text-green-200 text-sm">7/24 Aktif</span>
            </div>
            <p className="text-xs text-green-700 dark:text-green-300">Kesintisiz hizmet</p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gray-100 dark:bg-neutral-700 rounded-lg p-4">
          <h4 className="font-medium text-foreground mb-3 text-sm">Sistem Durumu</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">100%</div>
              <div className="text-xs text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-primary">AI</div>
              <div className="text-xs text-muted-foreground">Engine</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};