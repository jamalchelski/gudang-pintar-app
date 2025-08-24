
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Boxes,
  ClipboardList,
  ArrowRightLeft,
  FileDown,
  PackageSearch,
  Users,
} from 'lucide-react';
import { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';

interface NavProps {
  role: UserRole;
}

const adminNavItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inventory', label: 'Inventory', icon: Boxes },
  { href: '/reorder', label: 'Reorder', icon: PackageSearch },
  { href: '/stock-take', label: 'Stock Take', icon: ClipboardList },
  { href: '/import-export', label: 'Import/Export', icon: ArrowRightLeft },
  { href: '/user-management', label: 'User Management', icon: Users },
];

const userNavItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inventory', label: 'Inventory', icon: Boxes },
];

export function Nav({ role }: NavProps) {
  const pathname = usePathname();
  const navItems = role === 'admin' ? adminNavItems : userNavItems;

  return (
    <SidebarMenu>
      {navItems.map(item => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href}>
            <SidebarMenuButton
              isActive={pathname === item.href}
              className={cn(
                'w-full justify-start',
                pathname === item.href &&
                  'bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90'
              )}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
