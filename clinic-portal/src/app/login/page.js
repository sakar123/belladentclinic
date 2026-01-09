'use client';

import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = () => {
    login();
    router.push('/dashboard');
  };

  return (
    <div className="container mx-auto py-10 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">Login</h1>
      <Button onClick={handleLogin}>Log in</Button>
    </div>
  );
}