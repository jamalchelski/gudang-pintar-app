
'use client';

import { useContext } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AppContext } from '@/contexts/app-provider';
import { Skeleton } from '../ui/skeleton';
import { Card } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { IncomingLog } from '@/lib/types';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';

const getTypeBadge = (type: IncomingLog['type']) => {
    switch (type) {
        case 'new_item':
            return <Badge variant="default">Item Baru</Badge>;
        case 'stock_update':
            return <Badge variant="secondary">Update Manual</Badge>;
        case 'stock_take':
            return <Badge className="bg-blue-100 text-blue-800">Stock Take</Badge>;
        case 'receiving':
            return <Badge className="bg-green-100 text-green-800">Penerimaan</Badge>;
        default:
            return <Badge variant="outline">Lainnya</Badge>;
    }
}

export function IncomingLogTable() {
  const { incomingLogs, loading } = useContext(AppContext);
  const { toast } = useToast();

  const handleExport = () => {
    if (incomingLogs.length === 0) {
      toast({
        title: 'Tidak Ada Data untuk Diekspor',
        description: 'Tidak ada riwayat barang masuk untuk diekspor.',
        variant: 'destructive',
      });
      return;
    }
    const dataToExport = incomingLogs.map(log => ({
        Timestamp: new Date(log.timestamp).toLocaleString(),
        SKU: log.itemId,
        'Item Name': log.itemName,
        Type: log.type,
        'PO Number': log.poNumber || '-',
        'Vendor': log.vendor || '-',
        'Quantity Added': log.quantityAdded,
        'New Quantity': log.newQuantity,
        User: log.user,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'IncomingLogs');
    XLSX.writeFile(workbook, `incoming_logs_report.csv`);
  };

   if (loading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <div className="space-y-4">
        <div className="flex justify-end">
            <Button onClick={handleExport} disabled={incomingLogs.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
            </Button>
        </div>
        <Card>
        <ScrollArea className="h-[70vh]">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Nama Item</TableHead>
                <TableHead>No. PO / Vendor</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead className="text-right">Jumlah Ditambah</TableHead>
                <TableHead className="text-right">Stok Baru</TableHead>
                <TableHead>Pengguna</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {incomingLogs.length > 0 ? (
                incomingLogs.map(log => (
                    <TableRow key={log.id}>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                        <div className="font-medium">{log.itemName}</div>
                        <div className="text-sm text-muted-foreground font-mono">{log.itemId}</div>
                    </TableCell>
                     <TableCell>
                        <div className="font-medium">{log.poNumber || '-'}</div>
                        <div className="text-sm text-muted-foreground">{log.vendor || '-'}</div>
                    </TableCell>
                    <TableCell>
                        {getTypeBadge(log.type)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-600">+{log.quantityAdded}</TableCell>
                    <TableCell className="text-right">{log.newQuantity}</TableCell>
                    <TableCell>{log.user}</TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                    Tidak ada data barang masuk.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </ScrollArea>
        </Card>
    </div>
  );
}
