"use client";
import { Auth0Provider } from '@auth0/auth0-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { LoadingOverlayProvider, useLoadingOverlay } from "../contexts/LoadingOverlayContext";
import LoadingOverlay from "../components/ui/loading-overlay";
import { ToastProvider } from "../components/ui/toast";
import FrontendLogBridge from "../components/system/frontend-log-bridge";
import BellaDentLogo from "../components/brand/belladent-logo";

const PUBLIC_PATHS = ['/login', '/unauthorized'];

function isPublicPath(pathname) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname?.startsWith(`${path}/`));
}

function AuthGateMessage({ title, message, showSpinner = true }) {
  return (
    <div className="min-h-dvh grid place-items-center bg-app-bg p-6">
      <div className="w-full max-w-md rounded-lg border border-app-border bg-white p-6 text-center shadow-sm">
        <BellaDentLogo priority className="mx-auto mb-6 h-20 w-auto max-w-[310px]" />
        {showSpinner ? (
          <div className="mx-auto mb-4 size-9 animate-spin rounded-full border-2 border-teal-100 border-t-teal-600" />
        ) : null}
        <h1 className="text-lg font-semibold text-app-foreground">{title}</h1>
        {message ? <p className="mt-2 text-sm text-app-muted">{message}</p> : null}
      </div>
    </div>
  );
}

function AuthGate({ children }) {
  const { isAuthenticated, isLoading, error, login, tokenReady } = useAuth();
  const pathname = usePathname();
  const isPublic = isPublicPath(pathname || '/');
  const loginStarted = useRef(false);

  useEffect(() => {
    if (isPublic || isLoading || isAuthenticated || error || loginStarted.current) {
      if (isAuthenticated || isPublic) loginStarted.current = false;
      return;
    }

    loginStarted.current = true;
    const returnTo = typeof window === 'undefined'
      ? (pathname || '/')
      : `${window.location.pathname}${window.location.search}${window.location.hash}`;

    login(returnTo).catch((loginError) => {
      loginStarted.current = false;
      if (process.env.NODE_ENV === 'development') {
        console.error('Auth redirect failed', loginError);
      }
    });
  }, [error, isAuthenticated, isLoading, isPublic, login, pathname]);

  if (isPublic) return children;

  if (error) {
    return (
      <AuthGateMessage
        title="Authentication failed"
        message={error.message || 'Sign out and try again, or check the local Auth0 settings.'}
        showSpinner={false}
      />
    );
  }

  if (isLoading || !isAuthenticated) {
    return <AuthGateMessage title="Redirecting to sign in" />;
  }

  if (!tokenReady) {
    return <AuthGateMessage title="Preparing secure session" />;
  }

  return children;
}

function FetchMonkeyPatch() {
  // Patch window.fetch to show overlay for mutating requests
  const { show, hide } = useLoadingOverlay();
  if (typeof window !== 'undefined') {
    if (!window.__patchedFetch) {
      const original = window.fetch.bind(window);
      window.fetch = async (input, init = {}) => {
        const url = typeof input === 'string' ? input : input?.url;
        const method = (init.method || 'GET').toUpperCase();
        const isFrontendLog = String(url || '').includes('/api/dev/frontend-log');
        const shouldOverlay = !isFrontendLog && (method === 'POST' || method === 'PUT' || method === 'DELETE' || method === 'PATCH');
        if (shouldOverlay) show();
        try {
          const res = await original(input, init);
          if (!isFrontendLog && !res.ok && process.env.NODE_ENV === 'development') {
            console.warn('Fetch failed', { method, url: sanitizeUrl(url), status: res.status, statusText: res.statusText });
          }
          return res;
        } catch (error) {
          if (!isFrontendLog && process.env.NODE_ENV === 'development') {
            console.error('Fetch threw', { method, url: sanitizeUrl(url), error });
          }
          throw error;
        } finally {
          if (shouldOverlay) hide();
        }
      };
      window.__patchedFetch = true;
    }
  }
  return null;
}

function sanitizeUrl(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url, window.location.origin);
    ['access_token', 'id_token', 'token', 'code'].forEach((key) => {
      if (parsed.searchParams.has(key)) parsed.searchParams.set(key, '[redacted]');
    });
    return parsed.toString();
  } catch {
    return String(url);
  }
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
      cacheLocation="localstorage"
      useRefreshTokens
      useRefreshTokensFallback
      onRedirectCallback={(appState) => {
        router.replace(appState?.returnTo || '/');
      }}
    >
      <LoadingOverlayProvider>
        <AuthProvider>
          <ToastProvider>
            <FrontendLogBridge />
            <FetchMonkeyPatch />
            <LoadingOverlay />
            <AuthGate>{children}</AuthGate>
          </ToastProvider>
        </AuthProvider>
      </LoadingOverlayProvider>
    </Auth0Provider>
  );
}
