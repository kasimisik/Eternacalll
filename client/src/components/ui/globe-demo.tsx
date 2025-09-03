import { Globe } from "@/components/ui/globe"

export function GlobeDemo() {
  return (
    <div className="relative flex size-full w-full max-w-xs sm:max-w-sm md:max-w-lg items-center justify-center overflow-hidden bg-transparent px-2 sm:px-4 md:px-8 pb-4 sm:pb-8 md:pb-12 pt-2 sm:pt-4 md:pt-6">
     <Globe className="top-2 sm:top-4 md:top-6" />
    </div>
  )
}