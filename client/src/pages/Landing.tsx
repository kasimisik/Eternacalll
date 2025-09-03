import { Link } from 'wouter';
import { useAuthHook } from '@/lib/auth-hook';
import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { TestimonialsSection } from "@/components/ui/testimonials-with-marquee"
import { Mic, Brain, Phone, Zap, MessageSquare } from 'lucide-react'

export default function Landing() {
  const { isSignedIn } = useAuthHook();

  // Türkçe kullanıcı yorumları
  const testimonials = [
    {
      author: {
        name: "Ahmet Yılmaz",
        handle: "@ahmetyilmaz",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
      },
      text: "AI sesli asistanımızı kullanmaya başladığımızdan beri müşteri memnuniyetimiz %80 arttı. Gerçekten çok etkileyici bir teknoloji!"
    },
    {
      author: {
        name: "Zeynep Demir",
        handle: "@zeynepdemir",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
      },
      text: "SIP entegrasyonu sayesinde mevcut telefon sistemimizi değiştirmeden AI'dan faydalanmaya başladık. Kurulum çok kolaydı."
    },
    {
      author: {
        name: "Mehmet Kaya",
        handle: "@mehmetkaya",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
      },
      text: "Azure Speech Services ile Türkçe konuşma tanıma kalitesi mükemmel. Müşterilerimiz robotla değil, gerçek bir kişiyle konuştuğunu düşünüyor."
    },
    {
      author: {
        name: "Fatma Özkan",
        handle: "@fatmaozkan",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
      },
      text: "24/7 müşteri destek hizmetimizi otomatikleştirdik. Artık gece yarısı bile müşterilerimize anında yanıt verebiliyoruz."
    },
    {
      author: {
        name: "Can Erdoğan",
        handle: "@canerdogan",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
      },
      text: "Anthropic Claude'nin doğal konuşma yeteneği inanılmaz. Müşteriler bot olduğunu anlamıyor bile!"
    }
  ];


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

      {/* Testimonials Section */}
      <TestimonialsSection
        title="Binlerce Türk işletmesi tarafından güveniliyor"
        description="AI sesli asistan teknolojimizle işlerini büyüten binlerce Türk girişimciye katılın"
        testimonials={testimonials}
        className="bg-muted/50"
      />

      {/* CTA Section */}
      {!isSignedIn && (
        <section className="py-20 px-8 bg-background">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                  Ücretsiz Deneyin
                </button>
              </Link>
              <Link href="/sign-in">
                <button className="border border-border text-foreground px-8 py-3 rounded-lg font-semibold hover:bg-accent transition-colors">
                  Giriş Yap
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}