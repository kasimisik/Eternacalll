import { ClerkProvider as BaseClerkProvider } from '@clerk/clerk-react';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface ClerkProviderProps {
  children: React.ReactNode;
}

// Create a context to track if we're in a real Clerk provider
const ClerkContext = createContext<boolean>(false);

export const useIsClerkEnabled = () => useContext(ClerkContext);

export function ClerkProvider({ children }: ClerkProviderProps) {
  const [publishableKey, setPublishableKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClerkKey = async () => {
      try {
        const response = await fetch('/api/config/clerk');
        const data = await response.json();
        setPublishableKey(data.publishableKey || "");
      } catch (error) {
        console.error('Failed to fetch Clerk config:', error);
        setPublishableKey("");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClerkKey();
  }, []);

  // Show loading while fetching the key
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If no Clerk key is configured, provide mock context
  if (!publishableKey) {
    return (
      <ClerkContext.Provider value={false}>
        {children}
      </ClerkContext.Provider>
    );
  }

  return (
    <ClerkContext.Provider value={true}>
      <BaseClerkProvider
        publishableKey={publishableKey}
        routerPush={(to) => window.history.pushState({}, '', to)}
        routerReplace={(to) => window.history.replaceState({}, '', to)}
        appearance={{
          elements: {
            formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
            card: "bg-card border border-border shadow-xl",
            headerTitle: "text-foreground",
            headerSubtitle: "text-muted-foreground",
            socialButtonsBlockButton: "border border-border hover:bg-accent",
            formFieldInput: "border border-input bg-background",
            footerActionLink: "text-primary hover:text-primary/90"
          },
          variables: {
            colorPrimary: "hsl(221.2, 83.2%, 53.3%)",
            colorBackground: "hsl(210, 40%, 98%)",
            colorInputBackground: "hsl(0, 0%, 100%)",
            colorInputText: "hsl(222.2, 84%, 4.9%)",
            borderRadius: "0.5rem"
          }
        }}
        signInFallbackRedirectUrl="/dashboard"
        signUpFallbackRedirectUrl="/dashboard"
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
        allowedRedirectOrigins={[
          window.location.origin,
          `https://6017fd2d-e63c-400e-895b-07c85d97c0c3-00-rh9v8mjbsg02.picard.replit.dev`
        ]}
      >
        {children}
      </BaseClerkProvider>
    </ClerkContext.Provider>
  );
}
