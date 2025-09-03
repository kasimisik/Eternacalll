import { Link } from 'wouter';
import { useAuthHook } from '@/lib/auth-hook';
import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"
import { NavBar } from "@/components/ui/tubelight-navbar"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { Home, User, Briefcase, LogIn, UserPlus, Bot, Mic, Brain, Phone, Zap, MessageSquare } from 'lucide-react'

export default function Landing() {
  const { isSignedIn } = useAuthHook();

  // Navigation items based on auth status
  const navItems = isSignedIn ? [
    { name: 'Home', url: '/', icon: Home },
    { name: 'Dashboard', url: '/dashboard', icon: Bot },
    { name: 'Profile', url: '/profile', icon: User },
    { name: 'Features', url: '#features', icon: Briefcase }
  ] : [
    { name: 'Home', url: '/', icon: Home },
    { name: 'Features', url: '#features', icon: Briefcase },
    { name: 'Sign In', url: '/sign-in', icon: LogIn },
    { name: 'Sign Up', url: '/sign-up', icon: UserPlus }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Tubelight Navbar */}
      <NavBar items={navItems} />
      {/* Hero Section with Spline 3D */}
      <Card className="w-full h-[600px] bg-black/[0.96] relative overflow-hidden border-0 rounded-none">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="white"
        />

        <div className="flex h-full">
          {/* Left content */}
          <div className="flex-1 p-8 relative z-10 flex flex-col justify-center">
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 mb-6">
              Azure AI
              <br />
              Voice Agent
            </h1>
            <p className="mt-4 text-neutral-300 max-w-lg text-lg mb-8">
              AI-powered voice communication with SIP integration, Azure Speech Services, and real-time conversation processing powered by Anthropic Claude.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {isSignedIn ? (
                <Link href="/dashboard">
                  <button 
                    className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    data-testid="button-dashboard-hero"
                  >
                    Go to Dashboard
                  </button>
                </Link>
              ) : (
                <Link href="/sign-in">
                  <button 
                    className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    data-testid="button-getstarted"
                  >
                    Get Started
                  </button>
                </Link>
              )}
              <Link href="/dashboard">
                <button 
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-black transition-colors"
                  data-testid="button-demo"
                >
                  View Demo
                </button>
              </Link>
            </div>
          </div>

          {/* Right content - 3D Scene */}
          <div className="flex-1 relative">
            <SplineScene
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
            />
          </div>
        </div>
      </Card>

      {/* Features Section */}
      <section id="features" className="py-20 px-8 bg-black">
        <div className="max-w-6xl mx-auto">

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Azure Speech Services */}
            <div className="relative rounded-[1rem] border border-gray-800 bg-gray-900/50 p-6 hover:bg-gray-900/70 transition-all">
              <GlowingEffect
                spread={30}
                glow={true}
                disabled={false}
                proximity={32}
                inactiveZone={0.01}
                borderWidth={1}
              />
              <div className="w-fit rounded-lg bg-gray-800 p-3 mb-4">
                <Mic className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Do things the right way
              </h3>
              <p className="text-sm text-gray-400">
                Running out of copy so I'll write anything.
              </p>
            </div>

            {/* Anthropic Claude AI */}
            <div className="relative rounded-[1rem] border border-gray-800 bg-gray-900/50 p-6 hover:bg-gray-900/70 transition-all">
              <GlowingEffect
                spread={30}
                glow={true}
                disabled={false}
                proximity={32}
                inactiveZone={0.01}
                borderWidth={1}
              />
              <div className="w-fit rounded-lg bg-gray-800 p-3 mb-4">
                <Brain className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                The best AI code editor ever.
              </h3>
              <p className="text-sm text-gray-400">
                Yes, it's true. I'm not even kidding. Ask my mom if you don't believe me.
              </p>
            </div>

            {/* SIP Integration */}
            <div className="relative rounded-[1rem] border border-gray-800 bg-gray-900/50 p-6 hover:bg-gray-900/70 transition-all">
              <GlowingEffect
                spread={30}
                glow={true}
                disabled={false}
                proximity={32}
                inactiveZone={0.01}
                borderWidth={1}
              />
              <div className="w-fit rounded-lg bg-gray-800 p-3 mb-4">
                <Phone className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                You should buy Aceternity UI Pro
              </h3>
              <p className="text-sm text-gray-400">
                It's the best money you'll ever spend
              </p>
            </div>

            {/* Real-time Processing */}
            <div className="relative rounded-[1rem] border border-gray-800 bg-gray-900/50 p-6 hover:bg-gray-900/70 transition-all">
              <GlowingEffect
                spread={30}
                glow={true}
                disabled={false}
                proximity={32}
                inactiveZone={0.01}
                borderWidth={1}
              />
              <div className="w-fit rounded-lg bg-gray-800 p-3 mb-4">
                <Zap className="h-5 w-5 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                This card is also built by Cursor
              </h3>
              <p className="text-sm text-gray-400">
                I'm not even kidding. Ask my mom if you don't believe me.
              </p>
            </div>

            {/* Advanced Analytics */}
            <div className="relative rounded-[1rem] border border-gray-800 bg-gray-900/50 p-6 hover:bg-gray-900/70 transition-all md:col-span-2 lg:col-span-1">
              <GlowingEffect
                spread={30}
                glow={true}
                disabled={false}
                proximity={32}
                inactiveZone={0.01}
                borderWidth={1}
              />
              <div className="w-fit rounded-lg bg-gray-800 p-3 mb-4">
                <MessageSquare className="h-5 w-5 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Coming soon on Aceternity UI
              </h3>
              <p className="text-sm text-gray-400">
                I'm writing the code as I record this, no shit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-8 bg-muted/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Transform Your Voice Communications?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of businesses using our AI voice technology
          </p>
          
          {!isSignedIn && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                  Start Free Trial
                </button>
              </Link>
              <Link href="/sign-in">
                <button className="border border-border text-foreground px-8 py-3 rounded-lg font-semibold hover:bg-accent transition-colors">
                  Sign In
                </button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}