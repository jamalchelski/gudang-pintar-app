'use client';

import React, { useContext } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Warehouse } from 'lucide-react';
import { Nav } from '@/components/nav';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AppContext } from '@/contexts/app-provider';
import { UserRole } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { role, setRole } = useContext(AppContext);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Warehouse className="w-8 h-8 text-sidebar-primary" />
            <h1 className="text-xl font-bold text-sidebar-foreground">Gudang Pintar</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <Nav role={role} />
        </SidebarContent>
        <SidebarFooter>
          <div className="flex flex-col gap-2">
            <Label>User Role</Label>
            <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b bg-background md:justify-end">
          <SidebarTrigger className="md:hidden" />
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src="https://placehold.co/100x100.png" alt="@user" />
              <AvatarFallback>{role === 'admin' ? 'A' : 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{role === 'admin' ? 'Admin' : 'Warehouse User'}</p>
              <p className="text-xs text-muted-foreground">{role === 'admin' ? 'admin@gudang.com' : 'user@gudang.com'}</p>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
