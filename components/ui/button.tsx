import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#00DE73] via-[#2EE58D] to-[#74F5C0] text-emerald-950 shadow-[0_12px_30px_rgba(0,222,115,0.35)] hover:shadow-[0_14px_36px_rgba(0,222,115,0.45)]",
        secondary:
          "bg-white text-emerald-900 border border-[#dfe5e1] hover:bg-emerald-50/60",
        outline:
          "border border-emerald-200 bg-transparent text-emerald-900 hover:bg-emerald-50/60",
        ghost: "text-emerald-900 hover:bg-emerald-50/60",
        subtle: "bg-emerald-600 text-white hover:bg-emerald-500",
      },
      size: {
        default: "h-12 px-5",
        sm: "h-10 px-4 text-sm",
        lg: "h-14 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

