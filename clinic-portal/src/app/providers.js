"use client";
import { Auth0Provider } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
  const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE;
  const isAuthConfigured = Boolean(domain && clientId);
  const authorizationParams = {
    redirect_uri: typeof window !== 'undefined' ? window.location.origin : '',
  };

  if (audience) {
    authorizationParams.audience = audience;
  }

  if (!isAuthConfigured) {
    console.error(
      'Missing Auth0 client configuration. Set NEXT_PUBLIC_AUTH0_DOMAIN and NEXT_PUBLIC_AUTH0_CLIENT_ID in clinic-portal/.env.local.'
    );
    return children;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={authorizationParams}
      onRedirectCallback={(appState) => {
        router.replace(appState?.returnTo || '/');
      }}
    >
      <LoadingOverlayProvider>
        <AuthProvider>
          <ToastProvider>
            <FetchMonkeyPatch />
            <LoadingOverlay />
            {children}
          </ToastProvider>
        </AuthProvider>
      </LoadingOverlayProvider>
    </Auth0Provider>
  );
}
