'use client';

import { createContext, useContext, useEffect } from 'react';
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

  // Wire up token getter for http.js so all API calls get Bearer token
  useEffect(() => {
    if (isAuthenticated) {
      setTokenGetter(() => getAccessTokenSilently());
      return;
    }
    setTokenGetter(null);
  }, [isAuthenticated, getAccessTokenSilently]);

  // Redirect to onboarding if profile completion is needed
  useEffect(() => {
    const needsProfileCompletion = user?.['https://clinic.app/needs_profile_completion'];
    if (needsProfileCompletion && pathname !== '/onboarding') {
      router.push('/onboarding');
    }
  }, [user, pathname, router]);

  const login = (returnTo = pathname || '/') => {
    const authorizationParams = {};
    const connection = process.env.NEXT_PUBLIC_AUTH0_CONNECTION;
    if (connection) {
      authorizationParams.connection = connection;
    }

    return loginWithRedirect({
      appState: { returnTo },
      authorizationParams,
    });
  };

  const logout = () =>
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
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
