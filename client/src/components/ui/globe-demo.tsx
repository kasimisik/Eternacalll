import { Globe } from "@/components/ui/globe"

export function GlobeDemo() {
  return (
    <div className="relative flex size-full w-full max-w-md sm:max-w-lg md:max-w-2xl items-center justify-center overflow-hidden rounded-lg border bg-black px-8 sm:px-16 md:px-40 pb-20 sm:pb-40 md:pb-80 pt-6 sm:pt-8 md:pt-12 shadow-xl">
     <Globe className="top-16 sm:top-24 md:top-36" />
    </div>
  )
}