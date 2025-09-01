import { useUser, useAuth } from '@clerk/clerk-react';
import { Card, CardContent } from '@/components/ui/card';
import { UserProfile } from '@/components/UserProfile';
import PaymentButton from '@/components/PaymentButton';
import { useState } from 'react';
import { CheckCircle, Dock, Clock } from 'lucide-react';

export default function Dashboard() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const formatLastSignIn = (lastSignInAt: Date | null) => {
    if (!lastSignInAt) return 'Never';
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - lastSignInAt.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return lastSignInAt.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-primary" data-testid="text-dashboard-title">Dashboard</h1>
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
                      {getInitials(user?.firstName || undefined, user?.lastName || undefined)}
                    </span>
                  </div>
                  <span data-testid="text-user-name">{user?.fullName || 'User'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {/* User Menu Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      <button 
                        onClick={() => {
                          setShowProfile(true);
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-foreground hover:bg-accent transition-colors"
                        data-testid="button-profile"
                      >
                        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </button>
                      <button className="w-full text-left px-4 py-2 text-foreground hover:bg-accent transition-colors">
                        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </button>
                      <hr className="border-border my-1" />
                      <button 
                        onClick={() => signOut()}
                        className="w-full text-left px-4 py-2 text-destructive hover:bg-accent transition-colors"
                        data-testid="button-signout"
                      >
                        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, <span data-testid="text-welcome-name">{user?.firstName || 'User'}</span>!
          </h2>
          <p className="text-muted-foreground">Here's what's happening with your account today.</p>
        </div>

        {/* Payment Section */}
        <Card className="mb-8 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Abonelik Yükseltme</h3>
            <p className="text-muted-foreground mb-4">
              Profesyonel Plan ile daha fazla özellik ve avantajlara sahip olun.
            </p>
            <PaymentButton />
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 shadow-sm">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Account Status</p>
                  <p className="text-2xl font-bold text-green-600" data-testid="status-account">Active</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-green-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6 shadow-sm">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Email Verified</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="status-email">
                    {user?.emailAddresses[0]?.verification?.status === 'verified' ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Dock className="text-primary h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6 shadow-sm">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Last Login</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-last-login">
                    {formatLastSignIn(user?.lastSignInAt || null)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-purple-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Card */}
        <Card className="mb-8 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
                <p className="text-foreground" data-testid="text-user-email">
                  {user?.emailAddresses[0]?.emailAddress || 'No email'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Full Name</label>
                <p className="text-foreground" data-testid="text-user-fullname">
                  {user?.fullName || 'No name set'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Member Since</label>
                <p className="text-foreground" data-testid="text-member-since">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Email Verified</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user?.emailAddresses[0]?.verification?.status === 'verified' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user?.emailAddresses[0]?.verification?.status === 'verified' ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </>
                  ) : (
                    'Pending'
                  )}
                </span>
              </div>
            </div>
            <div className="mt-6">
              <button 
                onClick={() => setShowProfile(true)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                data-testid="button-edit-profile"
              >
                Edit Profile
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Security & Privacy</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <h4 className="font-medium text-foreground">Password</h4>
                  <p className="text-sm text-muted-foreground">Manage your password</p>
                </div>
                <button className="text-primary hover:underline" data-testid="button-change-password">
                  Change
                </button>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <h4 className="font-medium text-foreground">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <button className="text-primary hover:underline" data-testid="button-enable-2fa">
                  Enable
                </button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <h4 className="font-medium text-foreground">Login Sessions</h4>
                  <p className="text-sm text-muted-foreground">Manage your active sessions</p>
                </div>
                <button className="text-primary hover:underline" data-testid="button-view-sessions">
                  View All
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Profile Modal */}
      {showProfile && (
        <UserProfile 
          onClose={() => setShowProfile(false)} 
        />
      )}

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
}
