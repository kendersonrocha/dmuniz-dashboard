"use client";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Spotlight effect — radial gradient that follows mouse.
 * Adapted from Aceternity UI Card Spotlight.
 */
export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(255, 255, 255, 0.08)",
}: {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    };
    el.addEventListener("mousemove", handler);
    return () => el.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-line bg-surface",
        "transition-all duration-300 hover:border-line-strong",
        className
      )}
      style={
        {
          "--spotlight-color": spotlightColor,
        } as React.CSSProperties
      }
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 40%)`,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
