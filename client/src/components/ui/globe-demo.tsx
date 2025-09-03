import { Globe } from "@/components/ui/globe"

export function GlobeDemo() {
  return (
    <div className="relative flex size-full w-full max-w-xs sm:max-w-sm md:max-w-lg items-center justify-center overflow-hidden rounded-lg border bg-background px-8 sm:px-16 md:px-40 pb-16 sm:pb-32 md:pb-60 pt-4 sm:pt-6 md:pt-8 shadow-xl">
     <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-4xl sm:text-6xl md:text-8xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10">
      Globe
     </span>
     <Globe className="top-12 sm:top-20 md:top-28" />
     <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_200%,rgba(0,0,0,0.2),rgba(255,255,255,0))]" />
    </div>
  )
}