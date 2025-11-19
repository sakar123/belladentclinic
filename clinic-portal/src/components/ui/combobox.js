"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { ChevronsUpDown, Check, X } from "lucide-react";

export default function Combobox({
  value,
  onChange,
  options = [],
  getLabel = (o) => String(o?.label ?? ""),
  getValue = (o) => o?.value,
  placeholder = "Search…",
  emptyText = "No results",
  className,
  disabled,
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQ("");
    }
  }, [open]);

  const items = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((o) => getLabel(o).toLowerCase().includes(needle));
  }, [q, options, getLabel]);

  const selected = useMemo(() => options.find((o) => getValue(o) === value), [options, value, getValue]);

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between rounded-md border border-app-border bg-app-surface px-3 py-2 text-left text-sm",
          disabled && "opacity-50"
        )}
      >
        <span className={cn("truncate", !selected && "text-app-muted")}>{selected ? getLabel(selected) : placeholder}</span>
        <ChevronsUpDown size={16} className="text-app-muted" />
      </button>
      {selected && (
        <button
          type="button"
          aria-label="Clear selection"
          onClick={(e) => {
            e.stopPropagation();
            onChange(undefined);
          }}
          className="absolute right-8 top-1/2 -translate-y-1/2 text-app-muted hover:text-app-foreground"
        >
          <X size={14} />
        </button>
      )}
      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-md border border-app-border bg-app-surface shadow-lg">
          <div className="p-2">
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={placeholder}
              className="h-9 w-full rounded-md border border-app-border bg-white px-2 text-sm text-black placeholder:text-gray-500"
            />
          </div>
          <div className="max-h-64 overflow-auto py-1">
            {items.length === 0 && (
              <div className="px-3 py-2 text-sm text-app-muted">{emptyText}</div>
            )}
            {items.map((o) => {
              const v = getValue(o);
              const active = v === value;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    onChange(v);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-app-bg",
                    active && "bg-blue-50"
                  )}
                >
                  <span className="truncate">{getLabel(o)}</span>
                  {active && <Check size={14} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
