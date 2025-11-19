import { cn } from "../../lib/utils";

export function Table({ className, ...props }) {
  return <table className={cn("w-full text-sm", className)} {...props} />;
}

export function Thead(props) {
  return <thead {...props} />;
}

export function Tbody(props) {
  return <tbody {...props} />;
}

export function Tr({ className, ...props }) {
  return <tr className={cn("border-b border-app-border/70", className)} {...props} />;
}

export function Th({ className, ...props }) {
  return (
    <th
      className={cn(
        "text-left font-semibold text-app-muted px-3 py-2",
        className
      )}
      {...props}
    />
  );
}

export function Td({ className, ...props }) {
  return <td className={cn("px-3 py-3 align-middle", className)} {...props} />;
}

