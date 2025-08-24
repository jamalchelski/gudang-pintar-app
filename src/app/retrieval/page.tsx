
'use client';

import { useContext } from 'react';
import { PageHeader } from '@/components/page-header';
import { AppContext } from '@/contexts/app-provider';
import { Button } from '@/components/ui/button';
import { RetrievalInventoryTable } from '@/components/retrieval/retrieval-inventory-table';
import { PickingList } from '@/components/retrieval/picking-list';
import { AlertTriangle, ShoppingCart } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function RetrievalPage() {
  const { pickingList, processPickingList, loading } = useContext(AppContext);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Pengambilan Sparepart">
        <Button onClick={processPickingList} disabled={pickingList.length === 0 || loading}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Proses Pengambilan
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Daftar Item Tersedia</h2>
            <RetrievalInventoryTable />
        </div>
        <div>
            <h2 className="text-xl font-semibold mb-4">Daftar Pengambilan</h2>
            {pickingList.length === 0 ? (
                 <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Daftar Kosong</AlertTitle>
                    <AlertDescription>
                        Pilih item dari tabel di sebelah kiri untuk menambahkannya ke daftar pengambilan.
                    </AlertDescription>
                </Alert>
            ) : (
                <PickingList />
            )}
        </div>
      </div>
    </div>
  );
}
