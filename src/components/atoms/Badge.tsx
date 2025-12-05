"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "neon" | "outline" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { className, variant = "default", size = "md", pulse = false, ...props },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cn(
          // Base styles
          "inline-flex items-center font-mono font-semibold uppercase tracking-wider",

          // Variants
          variant === "default" &&
            "bg-inflectiv-gray-800 text-inflectiv-gray-300",
          variant === "neon" && "bg-neon/20 text-neon border border-neon/30",
          variant === "outline" &&
            "bg-transparent text-neon border border-neon",
          variant === "success" && "bg-green-500/20 text-green-400",
          variant === "warning" && "bg-yellow-500/20 text-yellow-400",
          variant === "error" && "bg-red-500/20 text-red-400",

          // Sizes
          size === "sm" && "px-2 py-0.5 text-[10px]",
          size === "md" && "px-2.5 py-1 text-xs",
          size === "lg" && "px-3 py-1.5 text-sm",

          // Pulse animation
          pulse && "animate-pulse-glow",

          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
