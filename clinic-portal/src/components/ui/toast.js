"use client";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ToastContext = createContext({ notify: () => {} });

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const notify = useCallback((toast) => {
    const id = Math.random().toString(36).slice(2);
    const t = { id, ...toast };
    setToasts((prev) => [...prev, t]);
    const ttl = toast.duration ?? 3000;
    if (ttl > 0) setTimeout(() => dismiss(id), ttl);
    return id;
  }, []);
  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="rounded-md border border-app-border bg-app-surface px-4 py-3 shadow"
            >
              <div className="text-sm font-medium">{t.title}</div>
              {t.description && (
                <div className="mt-0.5 text-xs text-app-muted">{t.description}</div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

