'use client';

import React, { useContext, useState } from 'react';
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

export function StockTakeTable() {
  const { inventory } = useContext(AppContext);
  const [counts, setCounts] = useState<Record<string, number | string>>({});

  const handleCountChange = (itemId: string, value: string) => {
    setCounts(prev => ({ ...prev, [itemId]: value }));
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
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
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
      </div>
    </div>
  );
}
