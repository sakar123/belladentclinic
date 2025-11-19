import { cn } from "../../lib/utils";

export default function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-app-border bg-white px-3 text-sm text-app-foreground",
        "placeholder:text-app-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50",
        "bg-app-surface",
        className
      )}
      {...props}
    />
  );
}

