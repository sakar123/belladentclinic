"use client";
import { AuthProvider } from "../contexts/AuthContext";
import { LoadingOverlayProvider, useLoadingOverlay } from "../contexts/LoadingOverlayContext";
import LoadingOverlay from "../components/ui/loading-overlay";
import { ToastProvider } from "../components/ui/toast";

function FetchMonkeyPatch() {
  // Patch window.fetch to show overlay for mutating requests
  const { show, hide } = useLoadingOverlay();
  if (typeof window !== 'undefined') {
    if (!window.__patchedFetch) {
      const original = window.fetch.bind(window);
      window.fetch = async (input, init = {}) => {
        const method = (init.method || 'GET').toUpperCase();
        const shouldOverlay = method === 'POST' || method === 'PUT' || method === 'DELETE' || method === 'PATCH';
        if (shouldOverlay) show();
        try {
          const res = await original(input, init);
          return res;
        } finally {
          if (shouldOverlay) hide();
        }
      };
      window.__patchedFetch = true;
    }
  }
  return null;
}

export default function Providers({ children }) {
  return (
    <LoadingOverlayProvider>
      <AuthProvider>
        <ToastProvider>
          <FetchMonkeyPatch />
          <LoadingOverlay />
          {children}
        </ToastProvider>
      </AuthProvider>
    </LoadingOverlayProvider>
  );
}
