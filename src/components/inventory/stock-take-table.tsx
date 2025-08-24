
'use client';

import React, { useContext } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { AppContext } from '@/contexts/app-provider';
import { InventoryItem } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

interface StockTakeTableProps {
    counts: Record<string, number | string>;
    setCounts: React.Dispatch<React.SetStateAction<Record<string, string | number>>>;
}

export function StockTakeTable({ counts, setCounts }: StockTakeTableProps) {
  const { inventory } = useContext(AppContext);

  const handleCountChange = (itemId: string, value: string) => {
    // Allow empty string to clear the input, otherwise store as number
    const numericValue = value === '' ? '' : Number(value);
    if (numericValue === '' || (!isNaN(numericValue) && numericValue >= 0)) {
        setCounts(prev => ({ ...prev, [itemId]: numericValue }));
    }
  };
  
  const getVarianceClass = (item: InventoryItem) => {
    const counted = Number(counts[item.id]);
    if (isNaN(counted) || counts[item.id] === '') return '';
    if (counted < item.quantity) return 'text-destructive';
    if (counted > item.quantity) return 'text-green-600';
    return 'text-muted-foreground';
  };

  return (
    <div className="bg-card rounded-lg shadow-sm">
      <ScrollArea className="h-[70vh]">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">System Qty</TableHead>
              <TableHead className="w-[150px] text-right">Counted Qty</TableHead>
              <TableHead className="text-right">Variance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map(item => {
              const countedQty = counts[item.id];
              const variance = countedQty !== undefined && countedQty !== '' ? Number(countedQty) - item.quantity : null;

              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.brand}</div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{item.id}</TableCell>
                  <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      className="text-right"
                      placeholder="Enter count"
                      value={counts[item.id] || ''}
                      onChange={e => handleCountChange(item.id, e.target.value)}
                      min="0"
                    />
                  </TableCell>
                  <TableCell className={cn("text-right font-bold", getVarianceClass(item))}>
                    {variance !== null ? (variance > 0 ? `+${variance}` : variance) : '-'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
