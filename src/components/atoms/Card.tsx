"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "neon" | "glass";
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", hover = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          "relative overflow-hidden transition-all duration-300",

          // Variants
          variant === "default" &&
            "bg-inflectiv-gray-900 border border-inflectiv-gray-800",
          variant === "neon" &&
            "bg-inflectiv-gray-900 border border-neon/30 shadow-neon-sm",
          variant === "glass" &&
            "bg-inflectiv-gray-900/50 backdrop-blur-md border border-inflectiv-gray-700/50",

          // Hover effects
          hover &&
            "cursor-pointer hover:border-neon/50 hover:shadow-neon-md hover:-translate-y-1",

          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pb-4", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6 pt-4 border-t border-inflectiv-gray-800", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardContent, CardFooter };
