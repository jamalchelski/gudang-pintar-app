
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

const getTypeBadge = (type: IncomingLog['type']) => {
    switch (type) {
        case 'new_item':
            return <Badge variant="default">Item Baru</Badge>;
        case 'stock_update':
            return <Badge variant="secondary">Update Manual</Badge>;
        case 'stock_take':
            return <Badge className="bg-blue-100 text-blue-800">Stock Take</Badge>;
        default:
            return <Badge variant="outline">Lainnya</Badge>;
    }
}

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
  );
}
