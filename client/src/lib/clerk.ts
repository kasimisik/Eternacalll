// Get Clerk publishable key
const getClerkPublishableKey = async () => {
  try {
    const response = await fetch('/api/config/clerk');
    const data = await response.json();
    return data.publishableKey || "";
  } catch (error) {
    console.error('Failed to fetch Clerk config:', error);
    return "";
  }
};

// Initialize with empty key, will be fetched later
let publishableKey = "";

// Fetch the key immediately
getClerkPublishableKey().then(key => {
  publishableKey = key;
});

export const CLERK_CONFIG = {
  get publishableKey() {
    return publishableKey;
  },
  appearance: {
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
  },
  signInUrl: "/sign-in",
  signUpUrl: "/sign-up",
  afterSignInUrl: "/dashboard",
  afterSignUpUrl: "/dashboard"
};
