
'use client';

import { useContext, useState, Fragment } from 'react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function RetrievalPage() {
  const { pickingList, processPickingList, loading } = useContext(AppContext);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleProcess = async () => {
    await processPickingList();
    setIsDialogOpen(false);
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
                        Anda akan memproses item berikut dari inventaris. Tindakan ini akan mengurangi stok. Apakah Anda yakin?
                    </DialogDescription>
                </DialogHeader>
                 <ScrollArea className="max-h-[300px] border rounded-md my-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead className="text-right">Jumlah</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pickingList.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-sm text-muted-foreground">{item.brand}</div>
                                    </TableCell>
                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
                <DialogFooter>
                     <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                     <Button onClick={handleProcess} disabled={loading}>
                        {loading ? 'Memproses...' : 'Ya, Konfirmasi & Proses'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="flex flex-col gap-4 lg:col-span-1">
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
        <div className="flex flex-col gap-4 lg:col-span-2">
            <h2 className="text-xl font-semibold">Daftar Item Tersedia</h2>
            <RetrievalInventoryTable />
        </div>
      </div>
    </div>
  );
}
