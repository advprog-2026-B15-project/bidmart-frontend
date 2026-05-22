'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getCurrentRole } from '@/lib/api';

export function useRequireAuth(requiredRole?: string): boolean {
  const router = useRouter();
  const token = getToken();
  const role = getCurrentRole();
  const isAuth = typeof window !== 'undefined' && !!token;

  useEffect(() => {
    if (!isAuth) {
      router.replace('/login');
    } else if (requiredRole && role?.toUpperCase() !== requiredRole.toUpperCase()) {
      router.replace('/');
    }
  }, [isAuth, role, requiredRole, router]);

  return isAuth;
}
