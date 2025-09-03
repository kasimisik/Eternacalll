"use client";

import { Box, Lock, Search, Settings, Sparkles } from "lucide-react";
import { GlowingEffect } from "./glowing-effect";
import { cn } from "@/lib/utils";

export function GlowingEffectDemo() {
  return (
    <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
      <GridItem
        area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
        icon={<Box className="h-4 w-4" />}
        title="Do things the right way"
        description="Running out of copy so I'll write anything."
      />
      <GridItem
        area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
        icon={<Settings className="h-4 w-4" />}
        title="The best AI code editor ever."
        description="Yes, it's true. I'm not even kidding. Ask my mom if you don't believe me."
      />
      <GridItem
        area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
        icon={<Lock className="h-4 w-4" />}
        title="You should buy Aceternity UI Pro"
        description="It's the best money you'll ever spend"
      />
      <GridItem
        area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
        icon={<Sparkles className="h-4 w-4" />}
        title="This card is also built by Cursor"
        description="I'm not even kidding. Ask my mom if you don't believe me."
      />
      <GridItem
        area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
        icon={<Search className="h-4 w-4" />}
        title="Coming soon on Aceternity UI"
        description="I'm writing the code as I record this, no shit."
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
    <li
      className={cn(
        "relative overflow-hidden rounded-lg border border-gray-800 bg-gray-900/50 p-4 hover:bg-gray-900/70 transition-all",
        area
      )}
    >
      <GlowingEffect
        disabled={false}
        glow={true}
        spread={30}
        proximity={32}
        inactiveZone={0.01}
        borderWidth={1}
      />
      <div className="flex h-[180px] flex-col justify-between">
        <div className="space-y-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-white">
            {icon}
          </div>
          <h3 className="font-semibold text-white">{title}</h3>
        </div>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </li>
  );
};