"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * HoverBorderGradient — Adapted from Aceternity UI.
 * Animated rotating gradient border, intensifies on hover.
 */
export function HoverBorderGradient({
  children,
  className,
  containerClassName,
  duration = 1.2,
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  duration?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const [direction, setDirection] = useState<"TOP" | "RIGHT" | "BOTTOM" | "LEFT">("TOP");

  const map: Record<string, string> = {
    TOP: "radial-gradient(20.7% 50% at 50% 0%, hsl(0,0%,100%) 0%, rgba(255,255,255,0) 100%)",
    LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, hsl(0,0%,100%) 0%, rgba(255,255,255,0) 100%)",
    BOTTOM: "radial-gradient(20.7% 50% at 50% 100%, hsl(0,0%,100%) 0%, rgba(255,255,255,0) 100%)",
    RIGHT: "radial-gradient(16.2% 41.2% at 100% 50%, hsl(0,0%,100%) 0%, rgba(255,255,255,0) 100%)",
  };
  const highlight =
    "radial-gradient(75% 181% at 50% 50%, #10b981 0%, rgba(16,185,129,0) 100%)";

  useEffect(() => {
    if (!hovered) {
      const id = setInterval(() => {
        setDirection((p) =>
          p === "TOP" ? "RIGHT" : p === "RIGHT" ? "BOTTOM" : p === "BOTTOM" ? "LEFT" : "TOP"
        );
      }, duration * 1000);
      return () => clearInterval(id);
    }
  }, [hovered, duration]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex content-center items-center overflow-visible rounded-full p-px",
        containerClassName
      )}
    >
      <div
        className={cn(
          "relative z-10 rounded-[inherit] bg-surface text-white",
          className
        )}
      >
        {children}
      </div>
      <motion.div
        className="absolute inset-0 z-0 flex-none overflow-hidden rounded-[inherit]"
        style={{ filter: "blur(2px)" }}
        initial={{ background: map[direction] }}
        animate={{ background: hovered ? [map[direction], highlight] : map[direction] }}
        transition={{ ease: "linear", duration }}
      />
      <div className="absolute inset-[2px] z-[1] rounded-[100px] bg-surface" />
    </div>
  );
}
