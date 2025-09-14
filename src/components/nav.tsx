
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Boxes,
  ClipboardList,
  ArrowRightLeft,
  PackageSearch,
  ShoppingCart,
  FileText,
  ArchiveRestore,
  UserCircle,
  BrainCircuit,
  QrCode,
} from 'lucide-react';
import { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';

interface NavProps {
  role: UserRole;
}

const baseNavItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inventory', label: 'Inventory', icon: Boxes },
  { href: '/retrieval', label: 'Pengambilan', icon: ShoppingCart },
];

const helpdeskNavItems = [
    ...baseNavItems,
    { href: '/receiving', label: 'Penerimaan', icon: ArchiveRestore },
    { href: '/reorder', label: 'Reorder', icon: PackageSearch },
    { href: '/stock-take', label: 'Stock Take', icon: ClipboardList },
    { href: '/profile', label: 'Profil', icon: UserCircle },
]

const adminNavItems = [
  ...helpdeskNavItems,
  { href: '/analysis', label: 'Analisis AI', icon: BrainCircuit },
  { href: '/import-export', label: 'Import/Export', icon: ArrowRightLeft },
  { href: '/reports', label: 'Laporan', icon: FileText },
];

const userNavItems = [
    ...baseNavItems,
    { href: '/profile', label: 'Profil', icon: UserCircle },
];

const getNavItems = (role: UserRole) => {
    switch (role) {
        case 'admin':
            return adminNavItems;
        case 'helpdesk':
            return helpdeskNavItems;
        case 'user':
            return userNavItems;
        default:
            return userNavItems;
    }
}

export function Nav({ role }: NavProps) {
  const pathname = usePathname();
  const navItems = getNavItems(role);

  return (
    <SidebarMenu>
      {navItems.map(item => {
        const isInventory = item.href === '/inventory';
        const isActive = isInventory ? pathname.startsWith('/inventory') : pathname === item.href;

        return (
            <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={cn(
                        'w-full justify-start',
                        isActive &&
                        'bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90'
                    )}
                    >
                    <Link href={item.href}>
                        <item.icon className="h-5 w-5 mr-3" />
                        <span>{item.label}</span>
                    </Link>
                </SidebarMenuButton>
            {isInventory && (
                 <SidebarMenuSub>
                    <SidebarMenuSubItem>
                         <Link href="/inventory/scan">
                            <SidebarMenuSubButton isActive={pathname === '/inventory/scan'}>
                                <QrCode />
                                <span>Scan Item</span>
                            </SidebarMenuSubButton>
                        </Link>
                    </SidebarMenuSubItem>
                </SidebarMenuSub>
            )}
            </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  );
}


