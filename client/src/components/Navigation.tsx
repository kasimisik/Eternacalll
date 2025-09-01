import { Link, useLocation } from 'wouter';
import { CLERK_CONFIG } from '@/lib/clerk';

export function Navigation() {
  const [location] = useLocation();
  const isClerkConfigured = !!CLERK_CONFIG.publishableKey;

  return (
    <nav className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-xl font-bold text-primary cursor-pointer" data-testid="logo">
                  Voice Agent
                </h1>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isClerkConfigured ? (
              <div className="text-sm text-muted-foreground">
                Authentication not configured
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <button 
                    className={`px-4 py-2 rounded-md transition-colors ${
                      location === '/dashboard' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-foreground hover:text-primary'
                    }`}
                    data-testid="button-dashboard"
                  >
                    Dashboard
                  </button>
                </Link>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                  U
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
