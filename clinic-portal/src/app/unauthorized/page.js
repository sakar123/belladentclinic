'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Unauthorized() {
  const { logout } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Unauthorized</h1>
        <p className="text-gray-700 mb-6">
          You do not have the required permissions to access this page.
          If you believe this is an error, please contact your administrator.
        </p>
        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition"
          >
            Go back Home
          </Link>
          <button
            onClick={logout}
            className="block w-full text-blue-600 font-semibold py-2 hover:underline"
          >
            Sign in with a different account
          </button>
        </div>
      </div>
    </div>
  );
}
