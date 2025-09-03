import { Link } from 'wouter';
import { useAuthHook } from '@/lib/auth-hook';
import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"

export default function Landing() {
  const { isSignedIn } = useAuthHook();

  return (
    <div className="min-h-screen bg-background">
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
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Modern Voice AI Technology
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Advanced speech processing with enterprise-grade security and scalability
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎤</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Azure Speech Services</h3>
              <p className="text-muted-foreground">
                Real-time speech-to-text and text-to-speech powered by Microsoft Azure's advanced AI models
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Anthropic Claude AI</h3>
              <p className="text-muted-foreground">
                Natural language understanding and generation with context-aware conversation handling
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📞</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">SIP Integration</h3>
              <p className="text-muted-foreground">
                Seamless telephone system integration with NetGSM and enterprise SIP providers
              </p>
            </Card>
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