import { ClerkProvider as BaseClerkProvider } from '@clerk/clerk-react';
import { CLERK_CONFIG } from '@/lib/clerk';

interface ClerkProviderProps {
  children: React.ReactNode;
}

export function ClerkProvider({ children }: ClerkProviderProps) {
  return (
    <BaseClerkProvider
      publishableKey={CLERK_CONFIG.publishableKey}
      appearance={CLERK_CONFIG.appearance}
      afterSignInUrl={CLERK_CONFIG.afterSignInUrl}
      afterSignUpUrl={CLERK_CONFIG.afterSignUpUrl}
      signInUrl={CLERK_CONFIG.signInUrl}
      signUpUrl={CLERK_CONFIG.signUpUrl}
    >
      {children}
    </BaseClerkProvider>
  );
}
