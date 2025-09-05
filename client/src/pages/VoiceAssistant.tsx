import SiriOrb from "@/components/ui/siri-orb";
import AnoAI from "@/components/ui/animated-shader-background";
import {
  NewSidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/new-sidebar";
import { Mic, Settings, History, Phone, User, VolumeX, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VoiceAssistant() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <NewSidebar>
          <SidebarHeader>
            <h2 className="text-lg font-semibold px-4 py-2">Sesli Asistan</h2>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Kontroller</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Mic className="h-4 w-4" />
                      <span>Mikrofonü Aç</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <VolumeX className="h-4 w-4" />
                      <span>Sessiz Mod</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Phone className="h-4 w-4" />
                      <span>Aramayı Başlat</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Ayarlar</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Settings className="h-4 w-4" />
                      <span>Ses Ayarları</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Volume2 className="h-4 w-4" />
                      <span>Ses Seviyesi</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <User className="h-4 w-4" />
                      <span>Profil Ayarları</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Geçmiş</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <History className="h-4 w-4" />
                      <span>Arama Geçmişi</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <div className="p-4 text-sm text-muted-foreground">
              Azure AI Voice Agent v1.0
            </div>
          </SidebarFooter>
        </NewSidebar>

        <SidebarInset>
          <header className="sticky top-0 flex h-16 items-center gap-2 px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <SidebarTrigger className="-ml-1" />
          </header>
          
          <div className="relative flex-1">
            {/* Animated background */}
            <div className="absolute inset-0 z-0">
              <AnoAI />
            </div>
            
            {/* Siri Orb overlay */}
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <SiriOrb
                size="256px"
                animationDuration={15}
                className="drop-shadow-2xl"
              />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}