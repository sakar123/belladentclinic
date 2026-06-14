'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      login();
    }
  }, [isAuthenticated, isLoading, login]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
      <img src="/images/belladent_logo_with_name.jpg" alt="BellaDent" className="h-12 w-auto mb-6" />
      <h1 className="text-3xl font-bold mb-3">Redirecting to sign in</h1>
      <p className="text-app-muted">You should be sent to your identity provider automatically.</p>
    </div>
  );
}
