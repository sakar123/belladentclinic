import { cn } from "../../lib/utils";

export default function Skeleton({ className }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-app-border/50",
        className
      )}
    />
  );
}

