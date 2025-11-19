import { cn } from "../../lib/utils";

export default function Badge({ variant = "default", className, ...props }) {
  const variants = {
    default: "bg-app-bg text-app-foreground border border-app-border",
    blue: "bg-blue-50 text-blue-700 border border-blue-200",
    green: "bg-green-50 text-green-700 border border-green-200",
    yellow: "bg-yellow-50 text-yellow-800 border border-yellow-200",
    gray: "bg-gray-100 text-gray-700 border border-gray-200",
    red: "bg-red-50 text-red-700 border border-red-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variants[variant] || variants.default,
        className
      )}
      {...props}
    />
  );
}

