
'use client';

import React, { useContext } from 'react';
import Image from 'next/image';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Warehouse, LogOut } from 'lucide-react';
import { Nav } from '@/components/nav';
import { AppContext } from '@/contexts/app-provider';
import { UserRole } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from './ui/button';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { MobileBottomNav } from './mobile-bottom-nav';

const getRoleDisplayName = (role: UserRole) => {
    switch(role) {
        case 'admin': return 'Administrator';
        case 'user': return 'Warehouse User';
        case 'helpdesk': return 'Helpdesk';
        default: return 'User';
    }
}

const getAvatarFallback = (role: UserRole) => {
     switch(role) {
        case 'admin': return 'A';
        case 'user': return 'U';
        case 'helpdesk': return 'H';
        default: return 'U';
    }
}


export function AppLayout({ children }: { children: React.ReactNode }) {
  const { role, user, loading } = useContext(AppContext);
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  if (!user) {
    // This should theoretically not be reached if AuthProvider is working correctly
    return null;
  }

  return (
    <SidebarProvider>
      <Sidebar className="hidden md:block">
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Consumable App Logo" width={40} height={40} />
            <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">Consumable App</h1>
                <p className="text-xs text-sidebar-foreground/70">ISS-MRCCC</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <Nav role={role} />
        </SidebarContent>
        <SidebarFooter>
           <Button variant="outline" className="bg-sidebar text-sidebar-foreground" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
            <p className="text-xs text-sidebar-foreground/50 text-center mt-2">
                V.1.2
            </p>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center justify-between p-4 border-b bg-background md:justify-end">
          <div className="w-8 md:hidden"></div>
          <div className="flex-1 text-center md:hidden">
            <div>
                <h1 className="text-sm font-bold">Consumable App</h1>
                <p className="text-xs text-muted-foreground">ISS-MRCCC</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Avatar>
              <AvatarImage src="https://placehold.co/100x100.png" alt="@user" />
              <AvatarFallback>{getAvatarFallback(role)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{getRoleDisplayName(role)}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
           <div className="w-8 md:hidden"></div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">{children}</main>
        <MobileBottomNav role={role} onLogout={handleLogout} userEmail={user.email || ''} />
      </SidebarInset>
    </SidebarProvider>
  );
}
