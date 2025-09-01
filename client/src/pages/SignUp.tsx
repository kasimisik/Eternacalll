import { SignUp as ClerkSignUp } from '@clerk/clerk-react';

export default function SignUp() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Hesap Oluştur</h2>
          <p className="text-muted-foreground">Yeni hesap oluşturun</p>
        </div>

        <ClerkSignUp
          appearance={{
            elements: {
              formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90 w-full py-3 rounded-lg font-semibold transition-colors",
              card: "shadow-none border-none p-0",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "social-button w-full flex items-center justify-center px-4 py-3 border border-border rounded-lg hover:bg-accent transition-colors mb-3",
              socialButtonsBlockButtonText: "font-medium",
              formFieldInput: "w-full px-3 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring",
              formFieldLabel: "text-muted-foreground text-sm font-medium mb-2 block",
              footer: "mt-6 text-center",
              footerActionText: "text-muted-foreground",
              footerActionLink: "text-primary hover:underline font-semibold ml-1",
              dividerLine: "bg-border",
              dividerText: "text-muted-foreground text-sm",
              formResendCodeLink: "text-primary hover:underline text-sm",
              identityPreviewText: "text-foreground",
              identityPreviewEditButton: "text-primary hover:underline",
              formHeaderTitle: "text-foreground text-lg font-semibold",
              formHeaderSubtitle: "text-muted-foreground text-sm",
              otpCodeFieldInput: "border border-input rounded focus:ring-2 focus:ring-ring",
              formButtonReset: "text-primary hover:underline",
              formFieldInputShowPasswordButton: "text-muted-foreground hover:text-foreground",
              formFieldSuccessText: "text-green-600 text-sm",
              formFieldErrorText: "text-destructive text-sm"
            },
            variables: {
              colorPrimary: "hsl(221.2, 83.2%, 53.3%)",
              colorBackground: "hsl(0, 0%, 100%)",
              colorInputBackground: "hsl(0, 0%, 100%)",
              colorInputText: "hsl(222.2, 84%, 4.9%)",
              borderRadius: "0.5rem",
              spacingUnit: "1rem"
            }
          }}
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}
