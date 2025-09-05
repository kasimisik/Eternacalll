import React, { useState } from "react";
import SiriOrb from "@/components/ui/siri-orb";
import AnoAI from "@/components/ui/animated-shader-background";
import { Mic, Settings, History, Phone, User, VolumeX, Volume2, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full h-screen">
      {/* Ana animated background */}
      <div className="absolute inset-0 z-0">
        <AnoAI />
      </div>
      
      {/* Sidebar Trigger Button - Sol üst köşede sabit */}
      <div className="absolute top-4 left-4 z-20">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="bg-background/80 backdrop-blur-sm border-border/50"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          
          <SheetContent side="left" className="w-80 p-0">
            <div className="flex h-full flex-col">
              <SheetHeader className="p-6 border-b">
                <SheetTitle>Sesli Asistan Kontrolleri</SheetTitle>
              </SheetHeader>
              
              <div className="flex-1 p-6 space-y-6">
                {/* Kontroller Bölümü */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Kontroller</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Mic className="h-4 w-4 mr-2" />
                      Mikrofonü Aç
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <VolumeX className="h-4 w-4 mr-2" />
                      Sessiz Mod
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Phone className="h-4 w-4 mr-2" />
                      Aramayı Başlat
                    </Button>
                  </div>
                </div>

                {/* Ayarlar Bölümü */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Ayarlar</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Ses Ayarları
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Volume2 className="h-4 w-4 mr-2" />
                      Ses Seviyesi
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Profil Ayarları
                    </Button>
                  </div>
                </div>

                {/* Geçmiş Bölümü */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Geçmiş</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <History className="h-4 w-4 mr-2" />
                      Arama Geçmişi
                    </Button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t p-6">
                <p className="text-sm text-muted-foreground text-center">
                  Azure AI Voice Agent v1.0
                </p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Siri Orb overlay - merkez */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <SiriOrb
          size="256px"
          animationDuration={15}
          className="drop-shadow-2xl"
        />
      </div>
    </div>
  );
}