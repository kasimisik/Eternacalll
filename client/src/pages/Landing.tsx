import * as React from 'react';
import { Link } from 'wouter';
import { useAuthHook } from '@/lib/auth-hook';
import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"
import { TestimonialsSection } from "@/components/ui/testimonials-with-marquee"
import { GlowingEffectDemo } from "@/components/ui/glowing-effect-demo"
import { Pricing } from "@/components/ui/pricing"
import { Footerdemo } from "@/components/ui/footer-section"
import { ExpandableChatDemo } from "@/components/ExpandableChatDemo"
import { HeaderDemo } from "@/components/HeaderDemo"
import { RainbowButton } from "@/components/ui/rainbow-button"
import { DisplayCardsDemo } from "@/components/ui/display-cards-demo"
import { GlobeDemo } from "@/components/ui/globe-demo"
import { MovingBorderDemo } from "@/components/ui/moving-border-demo"
import { Mic, Brain, Phone, Zap, MessageSquare } from 'lucide-react'

export default function Landing() {
  const { isSignedIn } = useAuthHook();
  const [isDarkMode, setIsDarkMode] = React.useState(true);

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode]);

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
      price: "1999",
      yearlyPrice: "1599",
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
      price: "8999",
      yearlyPrice: "7199",
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
      name: "KURUMSAL",
      price: "Özel Fiyat",
      yearlyPrice: "Özel Fiyat",
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
      {/* Header */}
      <HeaderDemo />
      
      {/* Hero Section with Spline 3D */}
      <Card className="w-full h-[500px] sm:h-[600px] md:h-[700px] bg-black relative overflow-hidden border-0 rounded-none mt-16 sm:mt-20">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="white"
        />

        <div className="flex flex-col md:flex-row h-full">
          {/* Left content */}
          <div className="flex-1 p-2 sm:p-4 md:p-8 relative z-10 flex flex-col justify-center">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 mb-4 md:mb-6">
              EternaCall
            </h1>
            <p className="mt-2 md:mt-4 text-neutral-300 max-w-lg text-base md:text-lg mb-6 md:mb-8">
              Gelişmiş AI teknolojisi ile güçlendirilmiş sesli asistan platformu. SIP entegrasyonu, Azure Konuşma Hizmetleri ve Anthropic Claude ile gerçek zamanlı konuşma işleme.
            </p>
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
      <section id="features" className="py-8 sm:py-12 md:py-20 px-2 sm:px-4 md:px-8 bg-black">
        <div className="max-w-6xl mx-auto">
          <GlowingEffectDemo />
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

      {/* CTA Section - Right after Pricing */}
      {!isSignedIn && (
        <section className="py-8 sm:py-12 md:py-20 px-2 sm:px-4 md:px-8 bg-black">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
              <Link href="/sign-up">
                <MovingBorderDemo />
              </Link>
              <Link href="/sign-in">
                <button className="w-full sm:w-auto border border-white/20 text-white px-6 md:px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                  Giriş Yap
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Display Cards Section */}
      <DisplayCardsDemo />

      {/* Globe Section */}
      <section className="py-16 sm:py-20 md:py-28 px-2 sm:px-4 md:px-8 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-4">
              Küresel Erişim
            </h2>
            <p className="text-gray-300 text-base sm:text-lg">
              Dünya çapında müşterilerinize ulaşın
            </p>
          </div>
          <div className="flex justify-center">
            <GlobeDemo />
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <Footerdemo 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode} 
      />

      {/* Expandable Chat Demo */}
      <ExpandableChatDemo />
    </div>
  );
}