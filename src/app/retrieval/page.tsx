
'use client';

import { useContext, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { AppContext } from '@/contexts/app-provider';
import { Button } from '@/components/ui/button';
import { RetrievalInventoryTable } from '@/components/retrieval/retrieval-inventory-table';
import { PickingList } from '@/components/retrieval/picking-list';
import { AlertTriangle, ShoppingCart } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RetrievalPage() {
  const { pickingList, processPickingList, loading } = useContext(AppContext);
  const [poNumber, setPoNumber] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleProcess = async () => {
    await processPickingList(poNumber);
    setIsDialogOpen(false);
    setPoNumber('');
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Pengambilan Sparepart">
         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button disabled={pickingList.length === 0 || loading}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Proses Pengambilan
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Konfirmasi Pengambilan</DialogTitle>
                    <DialogDescription>
                        Masukkan nomor PO atau referensi untuk pengambilan ini.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="po-number">Nomor PO / Referensi</Label>
                    <Input 
                        id="po-number"
                        value={poNumber}
                        onChange={(e) => setPoNumber(e.target.value)}
                        placeholder="Contoh: PO-12345"
                    />
                </div>
                <DialogFooter>
                     <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                     <Button onClick={handleProcess} disabled={loading}>
                        {loading ? 'Memproses...' : 'Konfirmasi & Proses'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
             <h2 className="text-xl font-semibold">Daftar Pengambilan</h2>
           
            {pickingList.length === 0 ? (
                 <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Daftar Kosong</AlertTitle>
                    <AlertDescription>
                        Pilih item dari tabel di bawah atau gunakan pemindai QR untuk menambahkannya ke daftar pengambilan.
                    </AlertDescription>
                </Alert>
            ) : (
                <PickingList />
            )}
        </div>
        <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Daftar Item Tersedia</h2>
            <RetrievalInventoryTable />
        </div>
      </div>
    </div>
  );
}
