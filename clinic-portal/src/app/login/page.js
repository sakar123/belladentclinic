'use client';

import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = () => {
    login();
    router.push('/');
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
      <img src="/images/belladent_logo_with_name.jpg" alt="BellaDent" className="h-12 w-auto mb-6" />
      <h1 className="text-3xl font-bold mb-3">Sign in</h1>
      <p className="text-app-muted mb-6">Access the BellaDent clinic portal</p>
      <Button onClick={handleLogin}>Continue</Button>
    </div>
  );
}
