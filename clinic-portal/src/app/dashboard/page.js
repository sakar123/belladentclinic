'use client';

import { useAuth } from '@/contexts/AuthContext';

import withAuth from '@/components/withAuth';

function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.name}!</h1>
      <p>This is your dashboard. You can see a summary of your upcoming appointments and other relevant information here.</p>
    </div>
  );
}

export default withAuth(DashboardPage);
