import { Globe } from "@/components/ui/globe"

export function GlobeDemo() {
  return (
    <div className="relative flex size-full w-full max-w-md sm:max-w-lg md:max-w-2xl items-center justify-center overflow-visible rounded-lg bg-black px-8 sm:px-16 md:px-40 pb-20 sm:pb-40 md:pb-80 pt-6 sm:pt-8 md:pt-12">
     <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-white to-gray-300/80 bg-clip-text text-center text-5xl sm:text-7xl md:text-9xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10 absolute top-4 sm:top-6 md:top-8 z-10">
      Globe
     </span>
     <Globe className="top-20 sm:top-28 md:top-40" />
    </div>
  )
}