"use client";
import { AuthProvider } from "../contexts/AuthContext";
import { ToastProvider } from "../components/ui/toast";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthProvider>
  );
}
