"use client";

import { Button } from "@/components/ui/button";
import { RainbowButton } from "@/components/ui/rainbow-button";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Menu, MoveRight, X } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

function Header1() {
  const navigationItems = [
     {
        title: "Ana Sayfa",
        href: "/",
        description: "",
     },
     {
        title: "Ürün",
        description: "AI sesli asistan teknolojimizle işinizi büyütün.",
        items: [
            {
               title: "Raporlar",
               href: "/reports",
            },
            {
               title: "İstatistikler",
               href: "/statistics",
            },
            {
               title: "Dashboard",
               href: "/dashboard",
            },
            {
               title: "Kayıtlar",
               href: "/recordings",
            },
        ],
     },
     {
        title: "Şirket",
        description: "Türkiye'nin öncü AI sesli asistan platformu.",
        items: [
            {
               title: "Hakkımızda",
               href: "/about",
            },
            {
               title: "Yatırımcılar",
               href: "/investors",
            },
            {
               title: "Kariyer",
               href: "/career",
            },
            {
               title: "İletişim",
               href: "/contact",
            },
        ],
     },
  ];

   const [isOpen, setOpen] = useState(false);
   return (
      <header className="w-full z-40 fixed top-0 left-0 bg-background/95 backdrop-blur-sm border-b border-border">
         <div className="container relative mx-auto min-h-20 flex gap-4 flex-row lg:grid lg:grid-cols-3 items-center">
            <div className="justify-start items-center gap-4 lg:flex hidden flex-row">
              <NavigationMenu className="flex justify-start items-start">
                 <NavigationMenuList className="flex justify-start gap-4 flex-row">
                    {navigationItems.map((item) => (
                      <NavigationMenuItem key={item.title}>
                         {item.href ? (
                            <>
                              <NavigationMenuLink asChild>
                                 <Link href={item.href}>
                                   <Button variant="ghost" className="text-foreground">{item.title}</Button>
                                 </Link>
                              </NavigationMenuLink>
                          </>
                       ) : (
                          <>
                            <NavigationMenuTrigger className="font-medium text-sm text-foreground">
                               {item.title}
                            </NavigationMenuTrigger>
                            <NavigationMenuContent className="!w-[450px] p-4 bg-background border border-border">
                               <div className="flex flex-col lg:grid grid-cols-2 gap-4">
                                  <div className="flex flex-col h-full justify-between">
                                    <div className="flex flex-col">
                                        <p className="text-base text-foreground">{item.title}</p>
                                        <p className="text-muted-foreground text-sm">
                                            {item.description}
                                        </p>
                                    </div>
                                    <Button size="sm" className="mt-10" variant="outline">
                                        Demo Rezervasyonu
                                    </Button>
                                  </div>
                                  <div className="flex flex-col text-sm h-full justify-end">
                                    {item.items?.map((subItem) => (
                                        <Link
                                            href={subItem.href}
                                            key={subItem.title}
                                        >
                                          <NavigationMenuLink
                                            className="flex flex-row justify-between items-center hover:bg-muted py-2 px-4 rounded text-foreground"
                                          >
                                              <span>{subItem.title}</span>
                                              <MoveRight className="w-4 h-4 text-muted-foreground" />
                                          </NavigationMenuLink>
                                        </Link>
                                    ))}
                                  </div>
                               </div>
                            </NavigationMenuContent>
                          </>
                       )}
                     </NavigationMenuItem>
                 ))}
               </NavigationMenuList>
            </NavigationMenu>
         </div>
         <div className="flex lg:justify-center">
            <Link href="/">
              <p className="font-semibold text-foreground text-lg">AI Voice Agent</p>
            </Link>
         </div>
         <div className="flex justify-end w-full gap-4">
            <Button variant="ghost" className="hidden md:inline text-foreground">
               Demo İste
            </Button>
            <div className="border-r hidden md:inline border-border"></div>
            <Link href="/sign-in">
              <Button variant="outline">Giriş Yap</Button>
            </Link>
            <Link href="/sign-up">
              <RainbowButton>Ücretsiz Deneyin</RainbowButton>
            </Link>
         </div>
         <div className="flex w-12 shrink lg:hidden items-end justify-end">
            <Button variant="ghost" onClick={() => setOpen(!isOpen)}>
               {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            {isOpen && (
               <div className="absolute top-20 border-t flex flex-col w-full right-0 bg-background border-border shadow-lg py-4 container gap-8">
                  {navigationItems.map((item) => (
                    <div key={item.title}>
                       <div className="flex flex-col gap-2">
                         {item.href ? (
                            <Link href={item.href}>
                              <div className="flex justify-between items-center">
                                <span className="text-lg text-foreground">{item.title}</span>
                                <MoveRight className="w-4 h-4 stroke-1 text-muted-foreground" />
                              </div>
                            </Link>
                         ) : (
                            <p className="text-lg text-foreground">{item.title}</p>
                         )}
                         {item.items &&
                            item.items.map((subItem) => (
                                <Link
                                   key={subItem.title}
                                   href={subItem.href}
                                >
                                   <div className="flex justify-between items-center">
                                     <span className="text-muted-foreground">
                                        {subItem.title}
                                     </span>
                                     <MoveRight className="w-4 h-4 stroke-1" />
                                   </div>
                                </Link>
                            ))}
                        </div>
                      </div>
                   ))}
                 </div>
                )}
             </div>
           </div>
         </header>
    );
}

export { Header1 };