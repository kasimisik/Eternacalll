import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { SignUp as ClerkSignUp } from '@clerk/clerk-react';

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

interface SignUpPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  onSignUp?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignUp?: () => void;
  onResetPassword?: () => void;
  onSignIn?: () => void;
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

export const SignUpPage: React.FC<SignUpPageProps> = ({
  title = <span className="font-light text-foreground tracking-tighter">Hesap Oluşturun</span>,
  description = "AI sesli asistan deneyiminize hemen başlayın",
  heroImageSrc,
  testimonials = [],
  onSignUp,
  onGoogleSignUp,
  onResetPassword,
  onSignIn,
}) => {
  const [showPassword, setShowPassword] = useState(false);

    return (
     <div className="h-[100dvh] flex flex-col md:flex-row font-geist w-[100dvw]">
       {/* Left column: sign-up form */}
    <section className="flex-1 flex items-center justify-center p-8">
     <div className="w-full max-w-md">
      <div className="flex flex-col gap-6">
       <h1 className="animate-element animate-delay-100 text-4xl md:text-5xl font-semibold leading-tight">{title}</h1>
       <p className="animate-element animate-delay-200 text-muted-foreground">{description}</p>

       <div className="animate-element animate-delay-300">
         <ClerkSignUp
           appearance={{
             elements: {
               formButtonPrimary: "w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors",
               card: "shadow-none border-none p-0 bg-transparent",
               headerTitle: "hidden",
               headerSubtitle: "hidden", 
               socialButtonsBlockButton: "w-full flex items-center justify-center gap-3 border border-border rounded-2xl py-4 hover:bg-secondary transition-colors mb-3",
               socialButtonsBlockButtonText: "font-medium",
               formFieldInput: "w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus:border-violet-400/70 focus:bg-violet-500/10",
               formFieldLabel: "text-sm font-medium text-muted-foreground mb-2 block",
               footer: "mt-6 text-center",
               footerActionText: "text-muted-foreground text-sm",
               footerActionLink: "text-violet-400 hover:underline transition-colors ml-1",
               dividerLine: "bg-border",
               dividerText: "text-muted-foreground text-sm bg-background px-4",
               formResendCodeLink: "text-violet-400 hover:underline text-sm",
               identityPreviewText: "text-foreground",
               identityPreviewEditButton: "text-violet-400 hover:underline",
               formHeaderTitle: "text-foreground text-lg font-semibold",
               formHeaderSubtitle: "text-muted-foreground text-sm",
               otpCodeFieldInput: "border border-border rounded focus:ring-2 focus:ring-violet-400",
               formButtonReset: "text-violet-400 hover:underline",
               formFieldInputShowPasswordButton: "absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors",
               formFieldAction: "text-violet-400 hover:underline text-sm transition-colors",
               formFieldSuccessText: "text-green-600 text-sm",
               formFieldErrorText: "text-red-500 text-sm"
             },
             variables: {
               colorPrimary: "hsl(221.2, 83.2%, 53.3%)",
               colorBackground: "transparent",
               colorInputBackground: "transparent", 
               colorInputText: "hsl(var(--foreground))",
               borderRadius: "1rem",
               spacingUnit: "1rem"
             }
           }}
           signInUrl="/sign-in"
           redirectUrl="/dashboard"
         />
       </div>
      </div>
     </div>
    </section>

    {/* Right column: hero image + testimonials */}
    {heroImageSrc && (
      <section className="hidden md:block flex-1 relative p-4">
        <div className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl bg-cover bg-center" style={{ backgroundImage: `url(${heroImageSrc})` }}></div>
        {testimonials.length > 0 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 px-8 w-full justify-center">
           <TestimonialCard testimonial={testimonials[0]} delay="animate-delay-1000" />
           {testimonials[1] && <div className="hidden xl:flex"><TestimonialCard testimonial={testimonials[1]} delay="animate-delay-1200" /></div>}
           {testimonials[2] && <div className="hidden 2xl:flex"><TestimonialCard testimonial={testimonials[2]} delay="animate-delay-1400" /></div>}
          </div>
        )}
       </section>
     )}
    </div>
  );
};