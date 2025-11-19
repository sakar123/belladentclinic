import { cn } from "../../lib/utils";

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-app-border bg-app-surface elevate",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("p-5 border-b border-app-border", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn("text-base font-semibold", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-5", className)} {...props} />;
}

