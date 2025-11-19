"use client";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function Dialog({ open, onClose, children }) {
  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="absolute inset-0 grid place-items-center p-4">
            <motion.div
              role="dialog"
              aria-modal="true"
              className={cn(
                "w-full max-w-xl rounded-xl border border-app-border bg-app-surface elevate"
              )}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.18 }}
            >
              {children}
            </motion.div>
          </div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

export function DialogHeader({ children }) {
  return <div className="px-5 pt-4 pb-3 border-b border-app-border">{children}</div>;
}

export function DialogTitle({ children }) {
  return <h3 className="text-base font-semibold">{children}</h3>;
}

export function DialogBody({ children }) {
  return <div className="px-5 py-4">{children}</div>;
}

export function DialogFooter({ children }) {
  return <div className="px-5 pt-2 pb-4 flex items-center justify-end gap-2 border-t border-app-border">{children}</div>;
}

