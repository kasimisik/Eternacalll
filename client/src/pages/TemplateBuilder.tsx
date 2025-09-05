import React from "react";
import { useLocation } from "wouter";
import { ShaderAnimation } from "@/components/ui/shader-animation";
import { TextShimmerWave } from "@/components/ui/text-shimmer-wave";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play } from "lucide-react";

export default function TemplateBuilder() {
  const [, setLocation] = useLocation();
  
  // URL'den template bilgilerini al (query params)
  const urlParams = new URLSearchParams(window.location.search);
  const templateTitle = urlParams.get('title') || 'AI Asistanı';
  const templateColor = urlParams.get('color') || '#3b82f6';

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Shader Animation Background */}
      <div className="absolute inset-0 z-0">
        <ShaderAnimation />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocation('/templates')}
            className="text-white hover:bg-white/10 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri Dön
          </Button>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          {/* Animated Title */}
          <div className="mb-8">
            <TextShimmerWave
              className="text-6xl md:text-8xl lg:text-9xl font-bold text-white [--base-color:#ffffff] [--base-gradient-color:#60a5fa]"
              duration={1.5}
              spread={0.8}
              zDistance={15}
              scaleDistance={1.2}
              rotateYDistance={25}
            >
              {templateTitle}
            </TextShimmerWave>
          </div>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl leading-relaxed">
            Kişiselleştirilmiş AI asistanınızı oluşturmaya başlayın. 
            Güçlü EternaCall teknolojisi ile mükemmel deneyim.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg"
              className="bg-white text-black hover:bg-white/90 backdrop-blur-sm px-8 py-4 text-lg font-semibold"
              onClick={() => setLocation('/dashboard')}
            >
              <Play className="w-5 h-5 mr-2" />
              Şimdi Başla
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white text-white hover:bg-white/10 backdrop-blur-sm px-8 py-4 text-lg"
              onClick={() => setLocation('/templates')}
            >
              Diğer Şablonları Gör
            </Button>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-6 text-center">
          <p className="text-white/60 text-sm">
            EternaCall ile AI asistanınızı dakikalar içinde oluşturun
          </p>
        </footer>
      </div>
    </div>
  );
}