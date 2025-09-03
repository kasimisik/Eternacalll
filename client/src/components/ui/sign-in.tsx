import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { SignIn as ClerkSignIn } from '@clerk/clerk-react';
import { BeamsBackground } from './beams-background';
import { motion } from 'framer-motion';

// --- HELPER COMPONENTS (ICONS) ---

const GoogleIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
     <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
     <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
     <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
     <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
   </svg>
);

// --- TYPE DEFINITIONS ---

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn?: () => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
}

// --- SUB-COMPONENTS ---

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
   {children}
  </div>
);

const TestimonialCard = ({ testimonial, delay }: { testimonial: Testimonial, delay: string }) => (
  <div className={`animate-testimonial ${delay} flex items-start gap-3 rounded-3xl bg-card/40 dark:bg-zinc-800/40 backdrop-blur-xl border border-white/10 p-5 w-64`}>
   <img src={testimonial.avatarSrc} className="h-10 w-10 object-cover rounded-2xl" alt="avatar" />
   <div className="text-sm leading-snug">
    <p className="flex items-center gap-1 font-medium">{testimonial.name}</p>
    <p className="text-muted-foreground">{testimonial.handle}</p>
    <p className="mt-1 text-foreground/80">{testimonial.text}</p>
   </div>
  </div>
);

// --- MAIN COMPONENT ---

export const SignInPage: React.FC<SignInPageProps> = ({
  title = <span className="font-light text-foreground tracking-tighter">Welcome</span>,
  description = "Access your account and continue your journey with us",
  heroImageSrc,
  testimonials = [],
  onSignIn,
  onGoogleSignIn,
  onResetPassword,
  onCreateAccount,
}) => {
  const [showPassword, setShowPassword] = useState(false);

    return (
     <BeamsBackground>
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.8 }}
         className="w-full max-w-sm relative z-10"
       >
         <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.05] shadow-2xl overflow-hidden">
           {/* Logo and header */}
           <div className="text-center space-y-1 mb-5">
             <motion.div
               initial={{ scale: 0.5, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ type: "spring", duration: 0.8 }}
               className="mx-auto w-10 h-10 rounded-full border border-white/10 flex items-center justify-center relative overflow-hidden"
             >
               <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">A</span>
               <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
             </motion.div>

             <motion.h1
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80"
             >
               Hoş Geldiniz
             </motion.h1>
             
             <motion.p
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.3 }}
               className="text-white/60 text-xs"
             >
               Hesabınıza giriş yapın
             </motion.p>
           </div>

           <ClerkSignIn
             appearance={{
               elements: {
                 formButtonPrimary: "w-full rounded-lg bg-white text-black font-medium h-10 hover:bg-white/90 transition-colors",
                 card: "shadow-none border-none p-0 bg-transparent",
                 headerTitle: "hidden",
                 headerSubtitle: "hidden", 
                 socialButtonsBlockButton: "w-full flex items-center justify-center gap-2 border border-white/10 rounded-lg py-3 hover:bg-white/5 transition-colors bg-white/5 text-white/80",
                 socialButtonsBlockButtonText: "font-medium text-white/80",
                 formFieldInput: "w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-3 pr-3 focus:bg-white/10 rounded-lg",
                 formFieldLabel: "text-sm font-medium text-white/60 mb-2 block",
                 footer: "mt-4 text-center",
                 footerActionText: "text-white/60 text-xs",
                 footerActionLink: "text-white hover:text-white/70 transition-colors ml-1 font-medium",
                 dividerLine: "bg-white/5",
                 dividerText: "text-white/40 text-xs bg-transparent px-3"
               },
               variables: {
                 colorPrimary: "white",
                 colorBackground: "transparent",
                 colorInputBackground: "transparent", 
                 colorInputText: "white",
                 borderRadius: "0.5rem"
               }
             }}
             signUpUrl="/sign-up"
             redirectUrl="/dashboard"
           />
         </div>
       </motion.div>
     </BeamsBackground>
  );
};