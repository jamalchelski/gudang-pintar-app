
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
  
  // If the user is not logged in, only show the login page.
  if (!user) {
    if (pathname === '/login') {
      return <>{children}</>;
    }
    // For any other page, it will be caught by the redirect in AppProvider
    return null; 
  }

  // If the user is logged in, show the AppLayout.
  if (pathname === '/login') {
    // This case should be handled by the redirect in AppProvider, but as a fallback:
    return null;
  }

  return <AppLayout>{children}</AppLayout>;
}
