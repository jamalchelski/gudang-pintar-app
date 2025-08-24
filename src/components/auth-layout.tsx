
'use client';

import { useContext } from 'react';
import { AppContext } from '@/contexts/app-provider';
import { usePathname } from 'next/navigation';
import { AppLayout } from './app-layout';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useContext(AppContext);
  const pathname = usePathname();

  if (loading) {
     return <div className="flex h-screen items-center justify-center">Memuat Aplikasi...</div>;
  }
  
  if (pathname === '/login') {
    return <>{children}</>;
  }

  if (user) {
    return <AppLayout>{children}</AppLayout>;
  }

  return null;
}
