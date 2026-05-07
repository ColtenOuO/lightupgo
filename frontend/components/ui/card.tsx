import * as React from "react";

import { cn } from "@/lib/utils";

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-3xl bg-white p-6 shadow-pop transition-transform hover:-translate-y-1",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-display text-xl font-bold text-ink", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardBody = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("mt-2 text-base leading-relaxed text-ink-soft", className)}
    {...props}
  />
));
CardBody.displayName = "CardBody";
