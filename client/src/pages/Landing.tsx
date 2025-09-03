import { Link } from 'wouter';
import { useAuthHook } from '@/lib/auth-hook';
import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { TestimonialsSection } from "@/components/ui/testimonials-with-marquee"
import { Pricing } from "@/components/ui/pricing"
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

  // Türkçe fiyatlandırma planları
  const pricingPlans = [
    {
      name: "BAŞLANGIÇ",
      price: "199",
      yearlyPrice: "159",
      period: "aylık",
      features: [
        "100 dakikaya kadar arama",
        "Temel AI sesli asistan",
        "Email destek",
        "Türkçe dil desteği",
        "Temel raporlama",
      ],
      description: "Küçük işletmeler ve girişimciler için",
      buttonText: "Ücretsiz Deneyin",
      href: "/sign-up",
      isPopular: false,
    },
    {
      name: "PROFESYONEL",
      price: "599",
      yearlyPrice: "479",
      period: "aylık",
      features: [
        "Sınırsız arama süresi",
        "Gelişmiş AI özellikleri",
        "SIP entegrasyonu",
        "24/7 telefon desteği",
        "Detaylı analitik",
        "Özel entegrasyonlar",
        "Çoklu dil desteği",
      ],
      description: "Büyüyen firmalar için ideal çözüm",
      buttonText: "Hemen Başlayın",
      href: "/sign-up",
      isPopular: true,
    },
    {
      name: "KURUMSAl",
      price: "1999",
      yearlyPrice: "1599",
      period: "aylık",
      features: [
        "Professional'daki tüm özellikler",
        "Özel AI modeli geliştirme",
        "Dedicated hesap yöneticisi",
        "1 saat içinde destek",
        "SSO kimlik doğrulama",
        "Gelişmiş güvenlik",
        "Özel sözleşme",
        "SLA garantisi",
      ],
      description: "Büyük organizasyonlar için",
      buttonText: "Satış Ekibiyle İletişim",
      href: "/sign-up",
      isPopular: false,
    },
  ];


  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Spline 3D */}
      <Card className="w-full h-[600px] md:h-[700px] bg-black/[0.96] relative overflow-hidden border-0 rounded-none">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="white"
        />

        <div className="flex flex-col md:flex-row h-full">
          {/* Left content */}
          <div className="flex-1 p-4 sm:p-8 relative z-10 flex flex-col justify-center">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 mb-4 md:mb-6">
              Azure AI
              <br />
              Voice Agent
            </h1>
            <p className="mt-2 md:mt-4 text-neutral-300 max-w-lg text-base md:text-lg mb-6 md:mb-8">
              AI-powered voice communication with SIP integration, Azure Speech Services, and real-time conversation processing powered by Anthropic Claude.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              {isSignedIn ? (
                <Link href="/dashboard">
                  <button 
                    className="w-full sm:w-auto bg-white text-black px-6 md:px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    data-testid="button-dashboard-hero"
                  >
                    Go to Dashboard
                  </button>
                </Link>
              ) : (
                <Link href="/sign-in">
                  <button 
                    className="w-full sm:w-auto bg-white text-black px-6 md:px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    data-testid="button-getstarted"
                  >
                    Get Started
                  </button>
                </Link>
              )}
              <Link href="/dashboard">
                <button 
                  className="w-full sm:w-auto border-2 border-white text-white px-6 md:px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-black transition-colors"
                  data-testid="button-demo"
                >
                  View Demo
                </button>
              </Link>
            </div>
          </div>

          {/* Right content - 3D Scene */}
          <div className="flex-1 relative h-64 md:h-auto">
            <SplineScene
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
            />
          </div>
        </div>
      </Card>

      {/* Features Section */}
      <section id="features" className="py-12 md:py-20 px-4 md:px-8 bg-black">
        <div className="max-w-6xl mx-auto">

          <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Azure Speech Services */}
            <div className="relative rounded-[1rem] border border-gray-800 bg-gray-900/50 p-4 md:p-6 hover:bg-gray-900/70 transition-all">
              <GlowingEffect
                spread={30}
                glow={true}
                disabled={false}
                proximity={32}
                inactiveZone={0.01}
                borderWidth={1}
              />
              <div className="w-fit p-4 mb-6">
                <Mic className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-white mb-2">
                Azure Speech Services
              </h3>
              <p className="text-sm text-gray-400">
                Yüksek kaliteli Türkçe ses tanıma ve sentezleme teknolojisi.
              </p>
            </div>

            {/* Anthropic Claude AI */}
            <div className="relative rounded-[1rem] border border-gray-800 bg-gray-900/50 p-4 md:p-6 hover:bg-gray-900/70 transition-all">
              <GlowingEffect
                spread={30}
                glow={true}
                disabled={false}
                proximity={32}
                inactiveZone={0.01}
                borderWidth={1}
              />
              <div className="w-fit p-4 mb-6">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-white mb-2">
                Anthropic Claude AI
              </h3>
              <p className="text-sm text-gray-400">
                Doğal dil işleme ve akıllı konuşma yetenekleri.
              </p>
            </div>

            {/* SIP Integration */}
            <div className="relative rounded-[1rem] border border-gray-800 bg-gray-900/50 p-4 md:p-6 hover:bg-gray-900/70 transition-all">
              <GlowingEffect
                spread={30}
                glow={true}
                disabled={false}
                proximity={32}
                inactiveZone={0.01}
                borderWidth={1}
              />
              <div className="w-fit p-4 mb-6">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-white mb-2">
                SIP Entegrasyonu
              </h3>
              <p className="text-sm text-gray-400">
                Mevcut telefon sistemlerinizle kolay entegrasyon.
              </p>
            </div>

            {/* Real-time Processing */}
            <div className="relative rounded-[1rem] border border-gray-800 bg-gray-900/50 p-4 md:p-6 hover:bg-gray-900/70 transition-all">
              <GlowingEffect
                spread={30}
                glow={true}
                disabled={false}
                proximity={32}
                inactiveZone={0.01}
                borderWidth={1}
              />
              <div className="w-fit p-4 mb-6">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-white mb-2">
                Gerçek Zamanlı İşleme
              </h3>
              <p className="text-sm text-gray-400">
                Anında yanıt veren hızlı AI asistan teknolojisi.
              </p>
            </div>

            {/* Advanced Analytics */}
            <div className="relative rounded-[1rem] border border-gray-800 bg-gray-900/50 p-4 md:p-6 hover:bg-gray-900/70 transition-all md:col-span-2 lg:col-span-1">
              <GlowingEffect
                spread={30}
                glow={true}
                disabled={false}
                proximity={32}
                inactiveZone={0.01}
                borderWidth={1}
              />
              <div className="w-fit p-4 mb-6">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-white mb-2">
                Gelişmiş Analitik
              </h3>
              <p className="text-sm text-gray-400">
                Detaylı raporlar ve performans metrikleri.
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
        className="bg-black text-white"
      />

      {/* Pricing Section */}
      <div className="bg-black">
        <Pricing
          plans={pricingPlans}
          title="Basit ve Şeffaf Fiyatlandırma"
          description="Size uygun planı seçin\nTüm planlar platformumuza erişim, müşteri kazanım araçları ve özel destek içerir."
        />
      </div>

      {/* CTA Section */}
      {!isSignedIn && (
        <section className="py-12 md:py-20 px-4 md:px-8 bg-background">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Link href="/sign-up">
                <button className="w-full sm:w-auto bg-primary text-primary-foreground px-6 md:px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                  Ücretsiz Deneyin
                </button>
              </Link>
              <Link href="/sign-in">
                <button className="w-full sm:w-auto border border-border text-foreground px-6 md:px-8 py-3 rounded-lg font-semibold hover:bg-accent transition-colors">
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