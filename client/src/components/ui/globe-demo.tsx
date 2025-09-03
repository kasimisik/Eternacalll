import { Globe } from "@/components/ui/globe"

export function GlobeDemo() {
  return (
    <div className="relative flex size-full w-full max-w-md sm:max-w-lg md:max-w-2xl items-center justify-center overflow-hidden rounded-lg border bg-background px-8 sm:px-16 md:px-40 pb-20 sm:pb-40 md:pb-80 pt-6 sm:pt-8 md:pt-12 shadow-xl">
     <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-5xl sm:text-7xl md:text-9xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10">
      Globe
     </span>
     <Globe className="top-16 sm:top-24 md:top-36" />
     <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_200%,rgba(0,0,0,0.2),rgba(255,255,255,0))]" />
    </div>
  )
}