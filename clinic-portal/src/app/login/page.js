'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import BellaDentLogo from '@/components/brand/belladent-logo';

function getReturnTo() {
  if (typeof window === 'undefined') return '/';
  const params = new URLSearchParams(window.location.search);
  const requested = params.get('returnTo') || '/';
  if (!requested.startsWith('/') || requested.startsWith('//') || requested.startsWith('/login')) {
    return '/';
  }
  return requested;
}

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const returnTo = getReturnTo();
    if (!isLoading && !isAuthenticated) {
      login(returnTo);
      return;
    }
    if (!isLoading && isAuthenticated) {
      router.replace(returnTo);
    }
  }, [isAuthenticated, isLoading, login, router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
      <BellaDentLogo priority className="mb-8 h-24 w-auto max-w-[360px]" />
      <h1 className="text-3xl font-bold mb-3">Redirecting to sign in</h1>
      <p className="text-app-muted">You should be sent to your identity provider automatically.</p>
    </div>
  );
}
