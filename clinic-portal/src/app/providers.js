"use client";
import { ToastProvider } from "../components/ui/toast";

// Auth temporarily disabled for dev; wrap with ToastProvider only
export default function Providers({ children }) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
}
