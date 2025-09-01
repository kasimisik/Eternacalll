import { Link } from 'wouter';
import { CLERK_CONFIG } from '@/lib/clerk';

export default function Landing() {
  const isClerkConfigured = !!CLERK_CONFIG.publishableKey;
  const isSignedIn = false; // Default to not signed in when Clerk is not configured

  return (
    <div className="auth-container min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center text-white">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Voice Agent System
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">
          AI-powered voice communication with SIP integration and real-time speech processing
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isSignedIn ? (
            <Link href="/dashboard">
              <button 
                className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                data-testid="button-dashboard-hero"
              >
                Go to Dashboard
              </button>
            </Link>
          ) : (
            <Link href="/sign-in">
              <button 
                className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                data-testid="button-getstarted"
              >
                Get Started
              </button>
            </Link>
          )}
          <Link href="/dashboard">
            <button 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors"
              data-testid="button-demo"
            >
              View Demo
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
