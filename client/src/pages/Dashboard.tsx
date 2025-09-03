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
    <div className="flex flex-1">
      {/* Main Content Area - V0 Chat Component - Full width */}
      <div className="flex-1 p-4 md:p-8 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex items-center justify-center min-h-screen">
        <VercelV0Chat />
      </div>
    </div>
  );
};