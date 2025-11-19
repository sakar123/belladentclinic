"use client";
import { createContext, useContext, useMemo, useState } from "react";
import { cn } from "../../lib/utils";

const TabsCtx = createContext({ value: undefined, setValue: () => {} });

export function Tabs({ defaultValue, value: valueProp, onValueChange, children, className }) {
  const [internal, setInternal] = useState(defaultValue);
  const value = valueProp !== undefined ? valueProp : internal;
  const setValue = (v) => {
    setInternal(v);
    onValueChange && onValueChange(v);
  };
  const ctx = useMemo(() => ({ value, setValue }), [value]);
  return (
    <TabsCtx.Provider value={ctx}>
      <div className={className}>{children}</div>
    </TabsCtx.Provider>
  );
}

export function TabsList({ children, className }) {
  return (
    <div className={cn("inline-flex rounded-md border border-app-border bg-app-surface p-1", className)}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className, onClick }) {
  const { value: current, setValue } = useContext(TabsCtx);
  const active = current === value;
  return (
    <button
      type="button"
      onClick={(e) => {
        setValue(value);
        onClick && onClick(e);
      }}
      aria-selected={active}
      className={cn(
        "px-3 py-1.5 text-sm rounded-md",
        active ? "bg-app-bg" : "hover:bg-app-bg",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className }) {
  const { value: current } = useContext(TabsCtx);
  const hidden = current !== value;
  return (
    <div className={className} hidden={hidden}>
      {!hidden && children}
    </div>
  );
}
