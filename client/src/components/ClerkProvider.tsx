import { ClerkProvider as BaseClerkProvider } from '@clerk/clerk-react';
import { CLERK_CONFIG } from '@/lib/clerk';
import React, { createContext, useContext } from 'react';

interface ClerkProviderProps {
  children: React.ReactNode;
}

// Create a context to track if we're in a real Clerk provider
const ClerkContext = createContext<boolean>(false);

export const useIsClerkEnabled = () => useContext(ClerkContext);

export function ClerkProvider({ children }: ClerkProviderProps) {
  // If no Clerk key is configured, provide mock context
  if (!CLERK_CONFIG.publishableKey) {
    return (
      <ClerkContext.Provider value={false}>
        {children}
      </ClerkContext.Provider>
    );
  }

  return (
    <ClerkContext.Provider value={true}>
      <BaseClerkProvider
        publishableKey={CLERK_CONFIG.publishableKey}
        appearance={CLERK_CONFIG.appearance}
        signInFallbackRedirectUrl={CLERK_CONFIG.afterSignInUrl}
        signUpFallbackRedirectUrl={CLERK_CONFIG.afterSignUpUrl}
        signInUrl={CLERK_CONFIG.signInUrl}
        signUpUrl={CLERK_CONFIG.signUpUrl}
      >
        {children}
      </BaseClerkProvider>
    </ClerkContext.Provider>
  );
}
