"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  glow?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", glow = false, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center font-mono font-semibold uppercase tracking-wider transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-neon focus:ring-offset-2 focus:ring-offset-black",
          "disabled:opacity-50 disabled:cursor-not-allowed",

          // Variants
          variant === "primary" &&
            "bg-neon text-black hover:bg-neon-bright active:bg-neon-dim",
          variant === "secondary" &&
            "bg-inflectiv-gray-800 text-white hover:bg-inflectiv-gray-700 border border-inflectiv-gray-600",
          variant === "outline" &&
            "bg-transparent text-neon border-2 border-neon hover:bg-neon hover:text-black",
          variant === "ghost" &&
            "bg-transparent text-inflectiv-gray-300 hover:text-neon hover:bg-inflectiv-gray-800/50",

          // Sizes
          size === "sm" && "px-3 py-1.5 text-xs",
          size === "md" && "px-5 py-2.5 text-sm",
          size === "lg" && "px-7 py-3.5 text-base",
          size === "xl" && "px-10 py-4 text-lg",

          // Glow effect
          glow && "shadow-neon-md hover:shadow-neon-lg",

          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
