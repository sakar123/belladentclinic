import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/utils";

const Button = React.forwardRef(function Button({ as: As = "button", asChild = false, className, variant = "default", size = "md", ...props }, ref) {
  const Comp = asChild ? Slot : As;
  const variants = {
    /* primary now white with subtle border */
    default: "bg-primary text-primary-foreground border border-app-border hover:bg-teal-600",
    /* blue secondary */
    secondary: "bg-secondary text-white hover:opacity-90",
    /* pink accent/tertiary */
    accent: "bg-tertiary text-white hover:opacity-90",
    outline: "border border-app-border bg-transparent hover:bg-app-bg",
    ghost: "bg-transparent hover:bg-app-bg",
    subtle: "bg-app-bg hover:bg-app-border/40",
  };
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-5 text-base",
    lg: "h-12 px-6 text-base",
    icon: "h-11 w-11 p-0 inline-flex items-center justify-center",
  };
  return (
    <Comp
      ref={ref}
      className={cn(
        "inline-flex items-center gap-2 rounded-md font-medium ring-focus",
        "disabled:opacity-50 disabled:pointer-events-none",
        variants[variant] || variants.default,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    />
  );
});

export default Button;
