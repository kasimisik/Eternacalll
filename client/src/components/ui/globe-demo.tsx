import { Globe } from "@/components/ui/globe"

export function GlobeDemo() {
  return (
    <div className="relative flex size-full w-full max-w-xs sm:max-w-sm md:max-w-lg items-center justify-center overflow-hidden rounded-lg bg-transparent px-4 sm:px-8 md:px-40 pb-8 sm:pb-20 md:pb-40 pt-4 sm:pt-6 md:pt-8">
     <Globe className="top-4 sm:top-14 md:top-28" />
     <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_200%,rgba(0,0,0,0.2),rgba(255,255,255,0))]" />
    </div>
  )
}