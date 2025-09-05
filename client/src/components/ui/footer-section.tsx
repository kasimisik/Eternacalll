"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Facebook, Instagram, Linkedin, Moon, Send, Sun, Twitter } from "lucide-react"

interface FooterdemoProps {
  isDarkMode?: boolean;
  setIsDarkMode?: (value: boolean) => void;
}

function Footerdemo({ 
  isDarkMode = true, 
  setIsDarkMode = () => {} 
}: FooterdemoProps) {

  return (
    <footer className="relative border-t bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">Bağlantıda Kalın</h2>
            <p className="mb-6 text-muted-foreground">
              Son güncellemeler ve özel teklifler için bültenimize katılın.
            </p>
            <form className="relative">
              <Input
                type="email"
                placeholder="Email adresinizi girin"
                className="pr-12 backdrop-blur-sm"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8 rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Abone ol</span>
              </Button>
            </form>
            <div className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Hızlı Bağlantılar</h3>
            <nav className="space-y-2 text-sm">
              <a href="#" className="block transition-colors hover:text-white">
                Ana Sayfa
              </a>
              <a href="#features" className="block transition-colors hover:text-white">
                Özellikler
              </a>
              <a href="/dashboard" className="block transition-colors hover:text-white">
                Dashboard
              </a>
              <a href="/sign-up" className="block transition-colors hover:text-white">
                Ücretsiz Deneyin
              </a>
              <a href="/sign-in" className="block transition-colors hover:text-white">
                Giriş Yap
              </a>
            </nav>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Bize Ulaşın</h3>
            <address className="space-y-2 text-sm not-italic">
              <p>Teknoloji Mahallesi, 123. Sokak</p>
              <p>İstanbul, Türkiye 34000</p>
              <p>Telefon: +90 (212) 555-0123</p>
              <p>Email: info@eternacall.com</p>
            </address>
          </div>
          <div className="relative">
            <h3 className="mb-4 text-lg font-semibold">Bizi Takip Edin</h3>
            <div className="mb-6 flex space-x-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Facebook className="h-4 w-4" />
                      <span className="sr-only">Facebook</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Facebook'ta bizi takip edin</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Twitter className="h-4 w-4" />
                      <span className="sr-only">Twitter</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Twitter'da bizi takip edin</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Instagram className="h-4 w-4" />
                      <span className="sr-only">Instagram</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Instagram'da bizi takip edin</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Linkedin className="h-4 w-4" />
                      <span className="sr-only">LinkedIn</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>LinkedIn'de bağlantı kurun</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4" />
              <Switch
                id="dark-mode"
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
              />
              <Moon className="h-4 w-4" />
              <Label htmlFor="dark-mode" className="sr-only">
                Karanlık modu aç/kapat
              </Label>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-center md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2025 EternaCall. Tüm hakları saklıdır.
          </p>
          <nav className="flex gap-4 text-sm">
            <a href="#" className="transition-colors hover:text-white">
              Gizlilik Politikası
            </a>
            <a href="#" className="transition-colors hover:text-white">
              Kullanım Şartları
            </a>
            <a href="#" className="transition-colors hover:text-white">
              Çerez Ayarları
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export { Footerdemo }