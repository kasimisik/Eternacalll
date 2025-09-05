"use client";

import { Phone, Shield, BarChart3, Brain, Headphones } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";

export function GlowingEffectDemo() {
  return (
    <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
      <GridItem
        area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
        icon={<Phone className="h-4 w-4" />}
        title="Her Çağrı Profesyonelce Karşılanır"
        description="AI asistanınız hiç uyumaz, her müşterinizi samimi bir şekilde karşılar."
      />
      <GridItem
        area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
        icon={<Brain className="h-4 w-4" />}
        title="Yapay Zeka ile Güçlendirilmiş"
        description="En gelişmiş dil modelleri ile donatılmış, insan gibi konuşan AI asistanı."
      />
      <GridItem
        area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
        icon={<Shield className="h-4 w-4" />}
        title="Güvenli ve Gizli"
        description="Müşteri verileriniz en yüksek güvenlik standartlarıyla korunur."
      />
      <GridItem
        area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
        icon={<Headphones className="h-4 w-4" />}
        title="7/24 Kesintisiz Hizmet"
        description="İşletmeniz her zaman açık, müşterileriniz asla meşgul sinyali duymazlar."
      />
      <GridItem
        area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
        icon={<BarChart3 className="h-4 w-4" />}
        title="Detaylı Analiz ve Raporlama"
        description="Her görüşme analiz edilir, iş geliştirme fırsatları size sunulur."
      />
    </ul>
  );
}

interface GridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
}

const GridItem = ({ area, icon, title, description }: GridItemProps) => {
  return (
    <li className={cn("min-h-[14rem] list-none", area)}>
      <div className="relative h-full rounded-2xl border border-border/50 p-3 md:rounded-3xl md:p-4">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={3}
        />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border border-border/30 bg-background/50 backdrop-blur-sm p-6 shadow-lg dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.5)] md:p-6">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg border-[0.75px] border-border bg-muted p-2">
              {icon}
            </div>
            <div className="space-y-3">
              <h3 className="pt-0.5 text-xl leading-[1.375rem] font-semibold font-sans tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-foreground">
                {title}
              </h3>
              <h2 className="[&_b]:md:font-semibold [&_strong]:md:font-semibold font-sans text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-muted-foreground">
                {description}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};