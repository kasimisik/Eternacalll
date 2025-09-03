"use client";
import React from "react";
import { Button } from "@/components/ui/moving-border";

export function MovingBorderDemo() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <Button
        borderRadius="1.75rem"
        className="bg-white dark:bg-slate-900 text-black dark:text-white border-neutral-200 dark:border-slate-800"
      >
        Ücretsiz Deneyin
      </Button>
    </div>
  );
}