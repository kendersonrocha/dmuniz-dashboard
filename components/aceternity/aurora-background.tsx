"use client";
import { cn } from "@/lib/utils";

/**
 * Aurora Background — Adapted from Aceternity UI.
 * Subtle aurora glow at the top of the screen.
 */
export function AuroraBackground({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("relative", className)}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div
          className={cn(
            "absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2",
            "rounded-full opacity-20 blur-[100px]",
            "bg-[conic-gradient(from_180deg_at_50%_50%,#10b98180_0deg,#8b5cf680_120deg,#06b6d480_240deg,#10b98180_360deg)]",
            "animate-aurora"
          )}
        />
      </div>
      {children}
    </div>
  );
}
