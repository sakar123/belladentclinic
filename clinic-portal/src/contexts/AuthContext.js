'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter, usePathname } from 'next/navigation';
import { setTokenGetter } from '@/lib/http';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
  } = useAuth0();
  const router = useRouter();
  const pathname = usePathname();
  const [tokenReady, setTokenReady] = useState(false);

  // Wire up token getter for http.js so all API calls get Bearer token
  useEffect(() => {
    if (!isAuthenticated) {
      setTokenGetter(null);
      setTokenReady(false);
      return;
    }

    setTokenGetter((options) => getAccessTokenSilently(options));
    setTokenReady(true);

    return () => {
      setTokenGetter(null);
    };
  }, [isAuthenticated, getAccessTokenSilently]);

  useEffect(() => {
    if (error && process.env.NODE_ENV === 'development') {
      console.error('Auth0 error', {
        name: error.name,
        message: error.message,
        error,
      });
    }
  }, [error]);

  // Redirect to onboarding if profile completion is needed
  useEffect(() => {
    const needsProfileCompletion = user?.['https://clinic.app/needs_profile_completion'];
    if (needsProfileCompletion && pathname !== '/onboarding') {
      router.push('/onboarding');
    }
  }, [user, pathname, router]);

  const login = useCallback((returnTo = pathname || '/') => {
    const authorizationParams = {};
    const connection = process.env.NEXT_PUBLIC_AUTH0_CONNECTION;
    if (connection) {
      authorizationParams.connection = connection;
    }

    return loginWithRedirect({
      appState: { returnTo },
      authorizationParams,
    });
  }, [loginWithRedirect, pathname]);

  const logout = useCallback(() => {
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });
  }, [auth0Logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        tokenReady,
        login,
        logout,
        getAccessTokenSilently,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
