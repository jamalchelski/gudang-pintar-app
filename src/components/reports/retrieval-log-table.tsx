
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
import { Button } from '../ui/button';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';

export function RetrievalLogTable() {
  const { retrievalLogs, loading } = useContext(AppContext);
  const { toast } = useToast();

  const handleExport = () => {
    if (retrievalLogs.length === 0) {
      toast({
        title: 'Tidak Ada Data untuk Diekspor',
        description: 'Tidak ada riwayat pengambilan untuk diekspor.',
        variant: 'destructive',
      });
      return;
    }
    const dataToExport = retrievalLogs.map(log => ({
        Timestamp: new Date(log.timestamp).toLocaleString(),
        SKU: log.itemId,
        'Item Name': log.itemName,
        'PO Number': log.poNumber || '-',
        'Quantity Retrieved': log.quantityRetrieved,
        User: log.user,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'RetrievalLogs');
    XLSX.writeFile(workbook, `retrieval_logs_report.csv`);
  };

  if (loading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <div className="space-y-4">
        <div className="flex justify-end">
            <Button onClick={handleExport} disabled={retrievalLogs.length === 0}>
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
                <TableHead className="hidden md:table-cell">No. PO/Ref</TableHead>
                <TableHead className="text-right">Jumlah Diambil</TableHead>
                <TableHead className="hidden md:table-cell">Pengguna</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {retrievalLogs.length > 0 ? (
                retrievalLogs.map(log => (
                    <TableRow key={log.id}>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                        <div className="font-medium">{log.itemName}</div>
                        <div className="text-sm text-muted-foreground font-mono">{log.itemId}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{log.poNumber || '-'}</TableCell>
                    <TableCell className="text-right font-bold">{log.quantityRetrieved}</TableCell>
                    <TableCell className="hidden md:table-cell">{log.user}</TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                    Tidak ada data pengambilan.
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
