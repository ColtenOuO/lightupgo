import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-display font-bold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun-200 disabled:pointer-events-none disabled:opacity-50 active:translate-y-1",
  {
    variants: {
      variant: {
        primary:
          "bg-coral-500 text-white shadow-pop-coral hover:bg-coral-400",
        sun: "bg-sun-500 text-ink shadow-pop-sun hover:bg-sun-400",
        mint: "bg-mint-500 text-white shadow-pop hover:bg-mint-400",
        outline:
          "border-2 border-ink/20 bg-white text-ink hover:bg-cream-200",
        ghost: "text-ink hover:bg-cream-200",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-base",
        lg: "h-14 px-8 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
