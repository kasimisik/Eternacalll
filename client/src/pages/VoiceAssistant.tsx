import SiriOrb from "@/components/ui/siri-orb";
import AnoAI from "@/components/ui/animated-shader-background";

export default function VoiceAssistant() {
  return (
    <div className="relative w-full h-screen">
      {/* Animated background */}
      <div className="absolute inset-0 z-0">
        <AnoAI />
      </div>
      
      {/* Siri Orb overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <SiriOrb
          size="256px"
          animationDuration={15}
          className="drop-shadow-2xl"
        />
      </div>
    </div>
  );
}