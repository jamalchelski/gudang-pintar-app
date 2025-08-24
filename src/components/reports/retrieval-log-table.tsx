
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

export function RetrievalLogTable() {
  const { retrievalLogs, loading } = useContext(AppContext);

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
              <TableHead className="text-right">Jumlah Diambil</TableHead>
              <TableHead>Pengguna</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {retrievalLogs.length > 0 ? (
              retrievalLogs.map(log => (
                <TableRow key={log.id}>
                  <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                  <TableCell className="font-medium">{log.itemName}</TableCell>
                  <TableCell className="font-mono text-xs">{log.itemId}</TableCell>
                  <TableCell className="text-right font-bold">{log.quantityRetrieved}</TableCell>
                  <TableCell>{log.user}</TableCell>
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
  );
}
