"use client";

import DisplayCards from "@/components/ui/display-cards";
import { Sparkles, Mic, Brain, Phone } from "lucide-react";

const defaultCards = [
  {
    icon: <Mic className="size-4 text-blue-300" />,
    title: "Akıllı Sesli Yanıtlama",
    description: "Her çağrıyı profesyonelce karşılar",
    date: "Aktif",
    iconClassName: "text-blue-500",
    titleClassName: "text-blue-500",
    className:
      "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
  },
  {
    icon: <Brain className="size-4 text-purple-300" />,
    title: "Doğal Konuşma",
    description: "İnsan gibi akıcı ve samimi diyalog",
    date: "7/24 Aktif",
    iconClassName: "text-purple-500",
    titleClassName: "text-purple-500",
    className:
      "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
  },
  {
    icon: <Phone className="size-4 text-green-300" />,
    title: "Anında Kurulum",
    description: "5 dakikada sisteminizle entegre",
    date: "Hazır",
    iconClassName: "text-green-500",
    titleClassName: "text-green-500",
    className:
      "[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10",
  },
];

function DisplayCardsDemo() {
  return (
    <div className="flex min-h-[400px] w-full items-center justify-center py-20 bg-black">
      <div className="w-full max-w-3xl">
        <DisplayCards cards={defaultCards} />
      </div>
    </div>
  );
}

export { DisplayCardsDemo };