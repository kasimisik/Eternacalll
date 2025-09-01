import { useUserHook, useAuthHook } from '@/lib/auth-hook';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, MessageSquare, Settings, Mic, PhoneCall, Activity, User, CreditCard, Crown, Play, Square, Radio, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import PaymentButton from '@/components/PaymentButton';

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
  const [sipStatus, setSipStatus] = useState<{
    running: boolean;
    netgsmConnected: boolean;
    activeCallsCount: number;
    activeCalls: any[];
    message: string;
    websocketEndpoint: string | null;
  } | null>(null);
  const [sipLoading, setSipLoading] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [testResponse, setTestResponse] = useState('');

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

  // SIP Agent durumunu kontrol et
  useEffect(() => {
    const checkSipStatus = async () => {
      try {
        const response = await fetch('/api/sip/status');
        const data = await response.json();
        setSipStatus(data);
      } catch (error) {
        console.error('SIP status check failed:', error);
      }
    };

    checkSipStatus();
    // Her 10 saniyede bir durumu kontrol et
    const interval = setInterval(checkSipStatus, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // SIP Agent'ı başlat
  const startSipAgent = async () => {
    setSipLoading(true);
    try {
      const response = await fetch('/api/sip/start-agent', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        setSipStatus(prev => prev ? { ...prev, running: true, message: data.message } : null);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('SIP start error:', error);
      alert('SIP Agent başlatılamadı');
    } finally {
      setSipLoading(false);
    }
  };

  // SIP Agent'ı durdur
  const stopSipAgent = async () => {
    setSipLoading(true);
    try {
      const response = await fetch('/api/sip/stop-agent', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        setSipStatus(prev => prev ? { ...prev, running: false, message: data.message } : null);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('SIP stop error:', error);
      alert('SIP Agent durdurulamadı');
    } finally {
      setSipLoading(false);
    }
  };

  // Test konuşma simülasyonu
  const testSpeech = async () => {
    if (!testInput.trim()) return;
    
    try {
      const response = await fetch('/api/sip/simulate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: testInput })
      });
      const data = await response.json();
      
      if (data.success) {
        setTestResponse(data.aiResponse);
      } else {
        setTestResponse('Hata: ' + data.error);
      }
    } catch (error) {
      console.error('Speech test error:', error);
      setTestResponse('Test başarısız oldu');
    }
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
              <h1 className="text-xl font-bold text-primary" data-testid="text-dashboard-title">Voice Agent Dashboard</h1>
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

        {/* Ödeme Seçenekleri - Sadece aboneliği olmayanlara göster */}
        {!loadingSubscription && !subscription?.hasSubscription && (
          <Card className="mb-8 border-primary">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <Crown className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">Profesyonel Plana Yükselt</h3>
                <p className="text-muted-foreground mb-4">
                  Tüm Voice Agent özelliklerine sınırsız erişim saglayın
                </p>
                <div className="text-3xl font-bold text-primary mb-4">₺60/ay</div>
                <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                  <li>✓ Sınırsız SIP çağrıları</li>
                  <li>✓ Gelişmiş ses tanıma</li>
                  <li>✓ Özel voice agent yapılandırması</li>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* SIP Voice Agent Status */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">SIP Voice Agent</h3>
                <div className="flex items-center space-x-2">
                  {sipStatus?.running ? (
                    <Radio className="w-6 h-6 text-green-500 animate-pulse" />
                  ) : (
                    <Radio className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Durum:</span>
                  <span className={`font-medium ${sipStatus?.running ? 'text-green-600' : 'text-red-600'}`}>
                    {sipStatus?.running ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">NetGSM:</span>
                  <span className={`font-medium ${sipStatus?.netgsmConnected ? 'text-green-600' : 'text-yellow-600'}`}>
                    {sipStatus?.netgsmConnected ? 'Bağlı' : 'Test Modu'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Aktif Çağrı:</span>
                  <span className="font-medium">{sipStatus?.activeCallsCount || 0}</span>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex space-x-2">
                  <button
                    onClick={startSipAgent}
                    disabled={sipLoading || sipStatus?.running}
                    className="flex-1 flex items-center justify-center space-x-2 bg-green-500 text-white px-3 py-2 rounded text-sm font-medium hover:bg-green-600 disabled:opacity-50"
                  >
                    <Play className="w-4 h-4" />
                    <span>Başlat</span>
                  </button>
                  <button
                    onClick={stopSipAgent}
                    disabled={sipLoading || !sipStatus?.running}
                    className="flex-1 flex items-center justify-center space-x-2 bg-red-500 text-white px-3 py-2 rounded text-sm font-medium hover:bg-red-600 disabled:opacity-50"
                  >
                    <Square className="w-4 h-4" />
                    <span>Durdur</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SIP Configuration */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">SIP Connection</h3>
                <Settings className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Provider:</span>
                  <span className="font-medium">NetGSM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Connection:</span>
                  <span className="text-green-600 font-medium">Connected</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Ping:</span>
                  <span className="font-medium">&lt; 1s</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Test Panel */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">AI Test</h3>
                <Zap className="w-5 h-5 text-muted-foreground" />
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground">Test Konuşması:</label>
                  <input
                    type="text"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder="Merhaba, nasılsınız?"
                    className="w-full mt-1 px-3 py-2 border rounded text-sm"
                  />
                </div>
                
                <button
                  onClick={testSpeech}
                  disabled={!testInput.trim() || !sipStatus?.running}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
                >
                  <Mic className="w-4 h-4" />
                  <span>Test Et</span>
                </button>
                
                {testResponse && (
                  <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                    <strong>AI Yanıtı:</strong><br />
                    {testResponse}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Call Activity</h3>
            <div className="space-y-3">
              {[
                { time: "14:32", caller: "+90 555 123 4567", duration: "3:45", status: "completed" },
                { time: "13:18", caller: "+90 555 987 6543", duration: "1:22", status: "completed" },
                { time: "12:05", caller: "+90 555 456 7890", duration: "2:10", status: "missed" },
                { time: "11:47", caller: "+90 555 111 2233", duration: "4:33", status: "completed" },
              ].map((call, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <PhoneCall className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{call.caller}</p>
                      <p className="text-xs text-muted-foreground">{call.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-muted-foreground">{call.duration}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      call.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {call.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2">
            <Phone className="w-5 h-5" />
            <span>Test Call</span>
          </button>
          <button className="p-4 bg-card border border-border rounded-lg hover:bg-accent transition-colors flex items-center justify-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>SIP Settings</span>
          </button>
          <button className="p-4 bg-card border border-border rounded-lg hover:bg-accent transition-colors flex items-center justify-center space-x-2">
            <Mic className="w-5 h-5" />
            <span>Speech Config</span>
          </button>
          <button className="p-4 bg-card border border-border rounded-lg hover:bg-accent transition-colors flex items-center justify-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>View Logs</span>
          </button>
        </div>
      </main>
    </div>
  );
}