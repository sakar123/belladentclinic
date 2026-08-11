'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { hasAccess } from '@/lib/auth';

function getCurrentReturnTo() {
  if (typeof window === 'undefined') return '/';
  const path = `${window.location.pathname || '/'}${window.location.search || ''}`;
  return path.startsWith('/') && !path.startsWith('//') ? path : '/';
}

export default function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, isLoading, error, login } = useAuth();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        login(getCurrentReturnTo());
      }
    }, [isAuthenticated, isLoading, login]);

    if (error) {
      return <AuthError message={error.message || 'Authentication failed'} />;
    }

    if (isLoading || !isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

export function withRole(Component, tier) {
  return function ProtectedComponent(props) {
    const { user, isAuthenticated, isLoading, error, login } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          login(getCurrentReturnTo());
        } else if (!hasAccess(user, tier)) {
          router.push('/unauthorized');
        }
      }
    }, [isAuthenticated, isLoading, login, user, router]);

    if (error) {
      return <AuthError message={error.message || 'Authentication failed'} />;
    }

    if (isLoading || !isAuthenticated || !hasAccess(user, tier)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

function AuthError({ message }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app-bg p-6">
      <div className="max-w-md rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <div className="font-semibold">Authentication failed</div>
        <div className="mt-1">{message}</div>
      </div>
    </div>
  );
}
