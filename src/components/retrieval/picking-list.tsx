
'use client';

import React, { useContext } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AppContext } from '@/contexts/app-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

export function PickingList() {
  const { pickingList, updatePickingListQuantity, removeItemFromPickingList, inventory } = useContext(AppContext);

  const handleQuantityChange = (itemId: string, value: string) => {
    const quantity = Number(value);
    const originalItem = inventory.find(i => i.id === itemId);
    if (!originalItem) return;
    
    // Ensure quantity doesn't exceed available stock
    if (!isNaN(quantity) && quantity >= 0 && quantity <= originalItem.quantity) {
        updatePickingListQuantity(itemId, quantity);
    } else if (value === '') {
        updatePickingListQuantity(itemId, 0);
    }
  };


  return (
    <Card>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(70vh-200px)] lg:h-auto lg:max-h-[300px]">
        <div className="flex flex-col">
          {pickingList.map(item => {
            const originalItem = inventory.find(i => i.id === item.id);
            return(
                <div key={item.id} className="flex items-center gap-4 p-4 border-b">
                    <div className="flex-grow">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.brand} | Stok: {originalItem?.quantity}</p>
                    </div>
                    <div className="w-20">
                         <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            min="1"
                            max={originalItem?.quantity}
                            className="h-8 text-center"
                        />
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeItemFromPickingList(item.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
          })}
        </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
