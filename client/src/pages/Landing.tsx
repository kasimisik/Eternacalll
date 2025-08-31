import { Link } from 'wouter';
import { useAuth } from '@clerk/clerk-react';

export default function Landing() {
  const { isSignedIn } = useAuth();

  return (
    <div className="auth-container min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center text-white">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Secure Authentication
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">
          React application with Clerk integration for seamless user management
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
