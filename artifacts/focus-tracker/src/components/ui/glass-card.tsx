import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  neonGlow?: "primary" | "accent" | "destructive" | "none";
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, neonGlow = "none", children, ...props }, ref) => {
    
    const glowClasses = {
      primary: "shadow-[0_0_30px_rgba(0,243,255,0.05)] border-primary/20",
      accent: "shadow-[0_0_30px_rgba(188,19,254,0.05)] border-accent/20",
      destructive: "shadow-[0_0_30px_rgba(255,50,100,0.05)] border-destructive/20",
      none: "shadow-2xl border-white/5",
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "bg-card/40 backdrop-blur-xl border rounded-2xl overflow-hidden relative",
          glowClasses[neonGlow],
          className
        )}
        {...props}
      >
        {/* Subtle inner top highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";
