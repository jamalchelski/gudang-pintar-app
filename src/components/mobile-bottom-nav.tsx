
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Boxes,
  QrCode,
  UserCircle,
  LogOut,
  ShoppingCart,
  ArchiveRestore,
  PackageSearch,
  ClipboardList,
  ArrowRightLeft,
  FileText,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MobileBottomNavProps {
  role: UserRole;
  onLogout: () => void;
  userEmail: string;
}

const inventorySubMenu = [
  { href: '/retrieval', label: 'Pengambilan', icon: ShoppingCart, roles: ['admin', 'helpdesk', 'user'] },
  { href: '/receiving', label: 'Penerimaan', icon: ArchiveRestore, roles: ['admin', 'helpdesk'] },
  { href: '/reorder', label: 'Reorder', icon: PackageSearch, roles: ['admin', 'helpdesk'] },
  { href: '/stock-take', label: 'Stock Take', icon: ClipboardList, roles: ['admin', 'helpdesk'] },
  { href: '/import-export', label: 'Import/Export', icon: ArrowRightLeft, roles: ['admin'] },
  { href: '/reports', label: 'Laporan', icon: FileText, roles: ['admin'] },
];

export function MobileBottomNav({ role, onLogout, userEmail }: MobileBottomNavProps) {
  const pathname = usePathname();
  const [isInventorySheetOpen, setIsInventorySheetOpen] = useState(false);
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);

  const mainNavItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { href: '/inventory/scan', label: 'Cari', icon: QrCode },
    { id: 'profile', label: 'Profile', icon: UserCircle },
  ];

  const filteredInventorySubMenu = inventorySubMenu.filter(item => item.roles.includes(role));

  const NavLink = ({ href, icon: Icon, label, isActive }: { href: string; icon: React.ElementType; label: string; isActive: boolean }) => (
    <Link href={href} className={cn(
        "flex flex-col items-center justify-center gap-1 text-xs p-2 rounded-lg",
        isActive ? "text-primary" : "text-muted-foreground"
    )}>
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );

  return (
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border">
      <div className="grid h-full grid-cols-4 font-medium">
        {mainNavItems.map((item) => {
          if (item.href) {
            const isActive = pathname === item.href;
            return (
              <NavLink key={item.label} href={item.href} icon={item.icon} label={item.label} isActive={isActive} />
            );
          }

          if (item.id === 'inventory') {
             const isInventoryActive = pathname.startsWith('/inventory') || filteredInventorySubMenu.some(sub => pathname === sub.href);
            return (
              <Sheet key={item.id} open={isInventorySheetOpen} onOpenChange={setIsInventorySheetOpen}>
                <SheetTrigger asChild>
                  <button className={cn(
                    "flex flex-col items-center justify-center gap-1 text-xs p-2 rounded-lg",
                    isInventoryActive ? "text-primary" : "text-muted-foreground"
                  )}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-lg">
                  <SheetHeader>
                    <SheetTitle>Menu Inventaris</SheetTitle>
                  </SheetHeader>
                  <div className="grid grid-cols-3 gap-4 p-4">
                     <Link href="/inventory" onClick={() => setIsInventorySheetOpen(false)} className="flex flex-col items-center gap-2 p-2 rounded-lg text-muted-foreground hover:bg-accent">
                        <Boxes className="h-6 w-6"/>
                        <span className="text-xs text-center">List Inventaris</span>
                     </Link>
                    {filteredInventorySubMenu.map(subItem => (
                      <Link key={subItem.href} href={subItem.href} onClick={() => setIsInventorySheetOpen(false)} className="flex flex-col items-center gap-2 p-2 rounded-lg text-muted-foreground hover:bg-accent">
                        <subItem.icon className="h-6 w-6" />
                        <span className="text-xs text-center">{subItem.label}</span>
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            );
          }

          if (item.id === 'profile') {
             const isProfileActive = pathname.startsWith('/profile');
            return (
              <Sheet key={item.id} open={isProfileSheetOpen} onOpenChange={setIsProfileSheetOpen}>
                <SheetTrigger asChild>
                  <button className={cn(
                      "flex flex-col items-center justify-center gap-1 text-xs p-2 rounded-lg",
                      isProfileActive ? "text-primary" : "text-muted-foreground"
                  )}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-lg">
                  <SheetHeader>
                    <SheetTitle>Profil & Pengaturan</SheetTitle>
                  </SheetHeader>
                  <div className="p-4 space-y-4">
                    <Link href="/profile" onClick={() => setIsProfileSheetOpen(false)} className="w-full">
                       <Button variant="outline" className="w-full justify-start">
                            <UserCircle className="mr-2 h-4 w-4"/> Ubah Password
                        </Button>
                    </Link>
                     <Separator />
                     <Button variant="ghost" className="w-full justify-start text-destructive" onClick={() => { onLogout(); setIsProfileSheetOpen(false); }}>
                        <LogOut className="mr-2 h-4 w-4" /> 
                        <div className="flex flex-col items-start">
                          <span>Logout</span>
                          <span className="text-xs text-muted-foreground font-normal">{userEmail}</span>
                        </div>
                     </Button>
                     <p className="text-xs text-muted-foreground text-center pt-4">
                        V.1.2
                    </p>
                  </div>
                </SheetContent>
              </Sheet>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
