"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

/**
 * Bento Grid — adapted from Aceternity UI.
 */
export function BentoGrid({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-3 md:auto-rows-[18rem] md:grid-cols-3", className)}>
      {children}
    </div>
  );
}

export function BentoGridItem({
  children,
  className,
  onClick,
  featured = false,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  featured?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className={cn(
        "group/bento relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border p-6",
        "transition-shadow duration-300 hover:shadow-2xl hover:shadow-black/40",
        featured
          ? "border-white/20 bg-gradient-to-br from-white/[0.08] to-white/[0.02] hover:border-white/40"
          : "border-line bg-surface hover:border-line-strong",
        className
      )}
    >
      {/* Glare effect */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/bento:opacity-100"
        style={{
          background:
            "radial-gradient(400px circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255,255,255,0.08), transparent 40%)",
        }}
      />
      <div className="relative flex h-full flex-col">{children}</div>
    </motion.div>
  );
}
