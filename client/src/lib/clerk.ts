// Get Clerk publishable key - use the real key from environment
const getClerkPublishableKey = () => {
  // Use the actual key from Replit Secrets
  return "pk_test_dXByaWdodC1hYXJkdmFyay03Mi5jbGVyay5hY2NvdW50cy5kZXYk";
};

export const CLERK_CONFIG = {
  publishableKey: getClerkPublishableKey(),
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
