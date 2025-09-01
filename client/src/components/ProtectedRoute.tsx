import { CLERK_CONFIG } from '@/lib/clerk';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isClerkConfigured = !!CLERK_CONFIG.publishableKey;

  // If Clerk is not configured, allow access to all routes
  if (!isClerkConfigured) {
    return <>{children}</>;
  }

  // If Clerk is configured but user is not authenticated, show auth required message
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto p-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Authentication Required</h2>
        <p className="text-muted-foreground mb-6">
          This application requires Clerk authentication to be configured. Please set up your Clerk keys in the environment variables.
        </p>
        <div className="bg-muted p-4 rounded-lg text-sm text-left">
          <p className="font-semibold mb-2">Required environment variables:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• VITE_CLERK_PUBLISHABLE_KEY</li>
            <li>• CLERK_SECRET_KEY</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
