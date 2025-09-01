import { Card, CardContent } from '@/components/ui/card';
import { Phone, MessageSquare, Settings, Mic, PhoneCall, Activity } from 'lucide-react';
import { CLERK_CONFIG } from '@/lib/clerk';

export default function Dashboard() {
  const isClerkConfigured = !!CLERK_CONFIG.publishableKey;

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
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                D
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isClerkConfigured && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="text-amber-800 font-semibold mb-2">Demo Mode</h3>
            <p className="text-amber-700 text-sm">
              You're viewing the application in demo mode. To enable full authentication features, configure your Clerk API keys.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Voice Agent Status */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Voice Agent</h3>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-green-600 font-medium">Active</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Calls Today:</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Average Duration:</span>
                  <span className="font-medium">2:34</span>
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

          {/* Speech Processing */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Speech Processing</h3>
                <Mic className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Engine:</span>
                  <span className="font-medium">Azure Cognitive</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Language:</span>
                  <span className="font-medium">Turkish (TR)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Latency:</span>
                  <span className="font-medium">~150ms</span>
                </div>
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