'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/api';

export function useRequireAuth(): boolean {
  const router = useRouter();
  const isAuth = typeof window !== 'undefined' && !!getToken();

  useEffect(() => {
    if (!isAuth) {
      router.replace('/login');
    }
  }, [isAuth, router]);

  return isAuth;
}
