import { Link } from 'wouter';
import { AlertCircle } from 'lucide-react';
import { CLERK_CONFIG } from '@/lib/clerk';

export default function SignIn() {
  const isClerkConfigured = !!CLERK_CONFIG.publishableKey;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Giriş Yap</h2>
          <p className="text-muted-foreground">Hesabınıza giriş yapın</p>
        </div>

        {!isClerkConfigured ? (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-amber-800 font-semibold text-sm mb-1">Demo Modu</h3>
                <p className="text-amber-700 text-sm">
                  Clerk kimlik doğrulama yapılandırılmamış. Demo modunda dashboard'a erişebilirsiniz.
                </p>
              </div>
            </div>
            
            <Link href="/dashboard">
              <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                Dashboard'a Git (Demo)
              </button>
            </Link>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>Tam kimlik doğrulama için Clerk API anahtarlarını yapılandırın:</p>
              <ul className="mt-2 space-y-1 text-xs">
                <li>VITE_CLERK_PUBLISHABLE_KEY</li>
                <li>CLERK_SECRET_KEY</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Clerk kimlik doğrulama yükleniyor...</p>
          </div>
        )}
      </div>
    </div>
  );
}
