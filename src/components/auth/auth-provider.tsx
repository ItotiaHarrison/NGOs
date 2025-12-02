'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { getCachedAuth, setCachedAuth } from '@/lib/auth-cache';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();
  const hasChecked = useRef(false);

  useEffect(() => {
    // Only check auth once on mount
    if (hasChecked.current) return;
    hasChecked.current = true;

    async function checkAuth() {
      // Check cache first
      const cached = getCachedAuth();
      if (cached !== null) {
        setUser(cached);
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          cache: 'no-store',
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setCachedAuth(data.user);
        } else {
          setUser(null);
          setCachedAuth(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
        setCachedAuth(null);
      }
    }

    checkAuth();
  }, [setUser, setLoading]);

  return <>{children}</>;
}
