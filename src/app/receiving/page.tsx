
'use client';

import { PageHeader } from '@/components/page-header';
import { ReceivingInventoryTable } from '@/components/receiving/receiving-inventory-table';

export default function ReceivingPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Penerimaan Sparepart" />
      <p className="text-muted-foreground">
        Gunakan halaman ini untuk mencatat penerimaan barang yang sudah terdaftar di inventaris.
        Untuk menambahkan item yang benar-benar baru, gunakan menu "Add Item" di halaman Inventory.
      </p>
      <ReceivingInventoryTable />
    </div>
  );
}
