
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReceivingItem } from '@/lib/types';
import { PoData } from './create-po-form';
import { ReceivingInventoryTable } from './receiving-inventory-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { ScrollArea } from '../ui/scroll-area';

interface ReceivingPoSessionProps {
  poData: PoData;
  receivedItems: ReceivingItem[];
  onAddItem: (item: ReceivingItem) => void;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
}

export function ReceivingPoSession({ 
    poData, 
    receivedItems, 
    onAddItem,
    onUpdateQuantity,
    onRemoveItem
}: ReceivingPoSessionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <h2 className="text-xl font-semibold mb-4">Tambah Item ke Penerimaan</h2>
        <ReceivingInventoryTable onAddItem={onAddItem} />
      </div>
      <div>
        <Card>
            <CardHeader>
                <CardTitle>Item Diterima</CardTitle>
                <CardDescription>
                    PO: <strong>{poData.poNumber}</strong><br/>
                    Vendor: <strong>{poData.vendor}</strong>
                </CardDescription>
            </CardHeader>
            <CardContent>
                 {receivedItems.length === 0 ? (
                 <Alert>
                    <AlertTitle>Daftar Kosong</AlertTitle>
                    <AlertDescription>
                        Pilih item dari tabel di sebelah kiri untuk menambahkannya ke daftar penerimaan ini.
                    </AlertDescription>
                </Alert>
            ) : (
                <ScrollArea className="h-[50vh]">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead className="w-[80px]">Jumlah</TableHead>
                            <TableHead className="w-[40px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {receivedItems.map(item => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">{item.id}</p>
                                </TableCell>
                                <TableCell>
                                    <Input 
                                        type="number" 
                                        value={item.quantity} 
                                        onChange={(e) => onUpdateQuantity(item.id, Number(e.target.value))}
                                        min="1"
                                        className="h-8"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onRemoveItem(item.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                </ScrollArea>
            )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
