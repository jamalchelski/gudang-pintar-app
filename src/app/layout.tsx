
import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/contexts/app-provider';
import { AppLayout } from '@/components/app-layout';
import { Toaster } from '@/components/ui/toaster';
import { AuthLayout } from '@/components/auth-layout';

export const metadata: Metadata = {
  title: 'Gudang Pintar',
  description: 'A smart warehouse inventory management system.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#225378" />
      </head>
      <body className="font-body antialiased">
        <AppProvider>
          <AuthLayout>
            {children}
          </AuthLayout>
        </AppProvider>
        <Toaster />
      </body>
    </html>
  );
}
