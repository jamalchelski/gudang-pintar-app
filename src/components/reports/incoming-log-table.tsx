
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

export function IncomingLogTable() {
  const { incomingLogs, loading } = useContext(AppContext);

   if (loading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <Card>
      <ScrollArea className="h-[70vh]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Nama Item</TableHead>
              <TableHead>SKU</TableHead>
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
                  <TableCell className="font-medium">{log.itemName}</TableCell>
                  <TableCell className="font-mono text-xs">{log.itemId}</TableCell>
                  <TableCell>
                    <Badge variant={log.type === 'new_item' ? 'default' : 'secondary'}>
                      {log.type === 'new_item' ? 'Item Baru' : 'Update Stok'}
                    </Badge>
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
  );
}
