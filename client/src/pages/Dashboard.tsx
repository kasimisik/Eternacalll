import { useUserHook, useAuthHook } from '@/lib/auth-hook';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Plus, CreditCard, Crown, Mic } from 'lucide-react';
import { useState, useEffect } from 'react';
import PaymentButton from '@/components/PaymentButton';
import { InteractiveAgentCreator } from '@/components/InteractiveAgentCreator';
import { AgentsList } from '@/components/AgentsList';
import { Link } from 'wouter';

export default function Dashboard() {
  const { user } = useUserHook();
  const { signOut } = useAuthHook();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [subscription, setSubscription] = useState<{
    hasSubscription: boolean;
    plan: string;
    email?: string;
    createdAt?: string;
  } | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [activeTab, setActiveTab] = useState('agents');
  const [agentsRefreshTrigger, setAgentsRefreshTrigger] = useState(0);

  // Kullanıcının abonelik durumunu kontrol et
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user?.id) return;
      
      try {
        setLoadingSubscription(true);
        const response = await fetch(`/api/user/subscription/${user.id}`);
        const data = await response.json();
        
        console.log('Subscription data:', data);
        setSubscription(data);
      } catch (error) {
        console.error('Subscription check failed:', error);
      } finally {
        setLoadingSubscription(false);
      }
    };

    checkSubscription();
  }, [user?.id]);

  const handleAgentCreated = () => {
    setAgentsRefreshTrigger(prev => prev + 1);
    setActiveTab('agents');
  };

  const handleAgentsUpdated = () => {
    setAgentsRefreshTrigger(prev => prev + 1);
  };

  const handleCreateAgentClick = () => {
    setActiveTab('create');
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Bot className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-primary" data-testid="text-dashboard-title">ElevenLabs AI Voice Agent Platform</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)} 
                  className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
                  data-testid="button-user-menu"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-semibold text-sm" data-testid="text-user-initials">
                      {getInitials(user?.firstName || undefined, user?.lastName || undefined) || 'U'}
                    </span>
                  </div>
                  <span className="hidden md:block font-medium">{user?.firstName || 'Kullanıcı'}</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-border">
                      <p className="font-medium text-foreground">{user?.fullName || 'Kullanıcı'}</p>
                      <p className="text-sm text-muted-foreground">{user?.primaryEmailAddress?.emailAddress || 'email@example.com'}</p>
                    </div>
                    <div className="p-1">
                      <button
                        onClick={() => signOut()}
                        className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
                        data-testid="button-signout"
                      >
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Abonelik Durumu */}
        {!loadingSubscription && (
          <div className={`mb-8 rounded-lg p-4 ${
            subscription?.hasSubscription 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-amber-50 border border-amber-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-semibold mb-2 ${
                  subscription?.hasSubscription ? 'text-green-800' : 'text-amber-800'
                }`}>
                  Hoş geldiniz, {user?.firstName || 'Kullanıcı'}!
                </h3>
                <p className={`text-sm ${
                  subscription?.hasSubscription ? 'text-green-700' : 'text-amber-700'
                }`}>
                  {subscription?.hasSubscription 
                    ? `${subscription.plan} aktif. Tüm özelliklere erişiminiz var.`
                    : 'Ücretsiz plan kullanıyorsunuz. Profesyonel özelliklere erişim için yükseltme yapın.'
                  }
                </p>
              </div>
              <div className="flex items-center">
                {subscription?.hasSubscription ? (
                  <Crown className="w-6 h-6 text-yellow-600" />
                ) : (
                  <CreditCard className="w-6 h-6 text-amber-600" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Interactive Voice Assistant Quick Access */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-blue-900 mb-1">🎤 Sesli AI Asistanı</h3>
                  <p className="text-sm text-blue-700">
                    Konuşarak etkileşim kurun! Basılı tutarak konuşun, asistanınız size cevap verecek.
                  </p>
                </div>
              </div>
              <Link href="/voice-assistant">
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
                  data-testid="button-start-voice-assistant"
                >
                  Başlat →
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Ödeme Seçenekleri - Sadece aboneliği olmayanlara göster */}
        {!loadingSubscription && !subscription?.hasSubscription && (
          <Card className="mb-8 border-primary">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <Crown className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">Profesyonel Plana Yükselt</h3>
                <p className="text-muted-foreground mb-4">
                  Tüm Voice Agent özelliklerine sınırsız erişim sağlayın
                </p>
                <div className="text-3xl font-bold text-primary mb-4">₺60/ay</div>
                <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                  <li>✓ Sınırsız AI ajanları</li>
                  <li>✓ ElevenLabs ses klonlama</li>
                  <li>✓ Özel telefon endpoint'leri</li>
                  <li>✓ Gelişmiş ses ayarları</li>
                  <li>✓ Öncelikli destek</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-center text-foreground">Ödeme Yöntemini Seçin:</h4>
                <PaymentButton />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Dashboard Content - ElevenLabs AI Agent Management */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="agents" className="flex items-center space-x-2">
              <Bot className="h-4 w-4" />
              <span>Ajanlarım</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Yeni Ajan</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="space-y-6">
            <AgentsList
              key={agentsRefreshTrigger}
              onAgentUpdated={handleAgentsUpdated}
              onCreateAgentClick={handleCreateAgentClick}
            />
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <InteractiveAgentCreator onAgentCreated={handleAgentCreated} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}