"use client";

import { memo, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { animate } from "motion/react";

interface GlowingEffectProps {
  blur?: number;
  inactiveZone?: number;
  proximity?: number;
  spread?: number;
  variant?: "default" | "white";
  glow?: boolean;
  className?: string;
  disabled?: boolean;
  movementDuration?: number;
  borderWidth?: number;
}
const GlowingEffect = memo(
  ({
    blur = 0,
    inactiveZone = 0.3,
    proximity = 80,
    spread = 40,
    variant = "default",
    glow = true,
    className,
    movementDuration = 1.5,
    borderWidth = 2,
    disabled = false,
  }: GlowingEffectProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const lastPosition = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef<number>(0);

    const handleMove = useCallback(
      (e: MouseEvent | PointerEvent) => {
        if (!containerRef.current) return;
        
        const element = containerRef.current;
        const rect = element.getBoundingClientRect();
        
        // Mouse pozisyonunu container'a göre hesapla
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        // Container'ın merkezi
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Mouse ile container arasındaki mesafe
        const distanceFromCenter = Math.hypot(mouseX - centerX, mouseY - centerY);
        
        // Proximity kontrolü - mouse kartın yakınında mı?
        const isNear = 
          mouseX >= rect.left - proximity &&
          mouseX <= rect.right + proximity &&
          mouseY >= rect.top - proximity &&
          mouseY <= rect.bottom + proximity;
        
        if (!isNear) {
          element.style.setProperty("--active", "0");
          return;
        }
        
        // İnactive zone kontrolü
        const minDimension = Math.min(rect.width, rect.height);
        const inactiveRadius = (minDimension / 2) * inactiveZone;
        
        if (distanceFromCenter < inactiveRadius) {
          element.style.setProperty("--active", "0");
          return;
        }
        
        // Effect'i aktif et
        element.style.setProperty("--active", "1");
        
        // Mouse'un container'a göre açısını hesapla
        const deltaX = mouseX - centerX;
        const deltaY = mouseY - centerY;
        let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
        
        // Açıyı normalize et (0-360)
        if (angle < 0) angle += 360;
        
        // Animasyonlu açı güncellemesi
        const currentAngle = parseFloat(element.style.getPropertyValue("--start")) || 0;
        
        // En kısa yolu hesapla
        let angleDiff = angle - currentAngle;
        if (angleDiff > 180) angleDiff -= 360;
        if (angleDiff < -180) angleDiff += 360;
        
        const targetAngle = currentAngle + angleDiff;
        
        animate(currentAngle, targetAngle, {
          duration: movementDuration,
          ease: [0.25, 0.46, 0.45, 0.94],
          onUpdate: (value: number) => {
            element.style.setProperty("--start", String(value % 360));
          },
        });
      },
      [proximity, inactiveZone, movementDuration]
    );

    useEffect(() => {
      if (disabled) return;

      const element = containerRef.current;
      if (!element) return;

      const handleMouseMove = (e: MouseEvent) => handleMove(e);
      const handleMouseLeave = () => {
        if (element) {
          element.style.setProperty("--active", "0");
        }
      };

      // Her card için ayrı mouse event listener'ları
      document.addEventListener("mousemove", handleMouseMove);
      element.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        element.removeEventListener("mouseleave", handleMouseLeave);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [handleMove, disabled]);

    return (
      <>
        <div
          className={cn(
            "pointer-events-none absolute -inset-px hidden rounded-[inherit] border opacity-0 transition-opacity",
            glow && "opacity-100",
            variant === "white" && "border-white",
            disabled && "!block"
          )}
        />
        <div
          ref={containerRef}
          style={
            {
              "--blur": `${blur}px`,
              "--spread": spread,
              "--start": "0",
              "--active": "0",
              "--glowingeffect-border-width": `${borderWidth}px`,
              "--repeating-conic-gradient-times": "5",
              "--gradient":
                variant === "white"
                  ? `repeating-conic-gradient(
                  from 236.84deg at 50% 50%,
                  var(--black),
                  var(--black) calc(25% / var(--repeating-conic-gradient-times))
                )`
                  : `radial-gradient(circle, #dd7bbb 10%, #dd7bbb00 20%),
                radial-gradient(circle at 40% 40%, #d79f1e 5%, #d79f1e00 15%),
                radial-gradient(circle at 60% 60%, #5a922c 10%, #5a922c00 20%), 
                radial-gradient(circle at 40% 60%, #4c7894 10%, #4c789400 20%),
                repeating-conic-gradient(
                  from 236.84deg at 50% 50%,
                  #dd7bbb 0%,
                  #d79f1e calc(25% / var(--repeating-conic-gradient-times)),
                  #5a922c calc(50% / var(--repeating-conic-gradient-times)), 
                  #4c7894 calc(75% / var(--repeating-conic-gradient-times)),
                  #dd7bbb calc(100% / var(--repeating-conic-gradient-times))
                )`,
            } as React.CSSProperties
          }
          className={cn(
            "pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity",
            glow && "opacity-100",
            blur > 0 && "blur-[var(--blur)] ",
            className,
            disabled && "!hidden"
          )}
        >
          <div
            className={cn(
              "glow",
              "rounded-[inherit]",
              'after:content-[""] after:rounded-[inherit] after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))]',
              "after:[border:var(--glowingeffect-border-width)_solid_transparent]",
              "after:[background:var(--gradient)] after:[background-attachment:fixed]",
              "after:opacity-[var(--active)] after:transition-opacity after:duration-300",
              "after:[mask-clip:padding-box,border-box]",
              "after:[mask-composite:intersect]",
              "after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]"
            )}
          />
        </div>
      </>
    );
  }
);

GlowingEffect.displayName = "GlowingEffect";

export { GlowingEffect };