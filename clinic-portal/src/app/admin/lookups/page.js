'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LookupsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/settings/lookups');
  }, [router]);
  return null;
}
