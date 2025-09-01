import { useAuth, UserButton } from '@clerk/clerk-react';
import { Link, useLocation } from 'wouter';

export function Navigation() {
  const { isSignedIn } = useAuth();
  const [location] = useLocation();

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
            {isSignedIn ? (
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
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8"
                    }
                  }}
                />
              </div>
            ) : (
              <Link href="/sign-in">
                <button 
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                  data-testid="button-signin"
                >
                  Giriş Yap
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
