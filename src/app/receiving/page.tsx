
'use client';

import { useState, useContext } from 'react';
import { PageHeader } from '@/components/page-header';
import { CreatePoForm, PoData } from '@/components/receiving/create-po-form';
import { ReceivingPoSession } from '@/components/receiving/receiving-po-session';
import { AppContext } from '@/contexts/app-provider';
import { ReceivingItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';


export default function ReceivingPage() {
  const [activePo, setActivePo] = useState<PoData | null>(null);
  const [receivedItems, setReceivedItems] = useState<ReceivingItem[]>([]);
  const { receiveItemsForPo, loading } = useContext(AppContext);

  const handleStartSession = (poData: PoData) => {
    setActivePo(poData);
    setReceivedItems([]);
  };

  const handleAddItemToSession = (item: ReceivingItem) => {
    setReceivedItems(prev => {
        const existing = prev.find(i => i.id === item.id);
        if (existing) {
            return prev.map(i => i.id === item.id ? {...i, quantity: i.quantity + item.quantity} : i);
        }
        return [...prev, item]
    });
  }

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    setReceivedItems(prev => prev.map(i => i.id === itemId ? {...i, quantity: newQuantity} : i));
  }

  const handleRemoveItem = (itemId: string) => {
    setReceivedItems(prev => prev.filter(i => i.id !== itemId));
  }

  const handleFinishSession = async () => {
    if (!activePo || receivedItems.length === 0) return;
    
    const success = await receiveItemsForPo(activePo, receivedItems);
    if (success) {
        setActivePo(null);
        setReceivedItems([]);
    }
  }

  const handleCancelSession = () => {
    setActivePo(null);
    setReceivedItems([]);
  }

  if (!activePo) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader title="Penerimaan Sparepart" />
        <p className="text-muted-foreground">
          Mulai sesi penerimaan baru dengan memasukkan Nomor Purchase Order (PO) dan nama Vendor.
        </p>
        <CreatePoForm onFormSubmit={handleStartSession} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
        <PageHeader title={`Menerima untuk PO: ${activePo.poNumber}`}>
            <Button variant="outline" onClick={handleCancelSession}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
            </Button>
            <Button onClick={handleFinishSession} disabled={receivedItems.length === 0 || loading}>
                {loading ? 'Menyimpan...' : 'Selesaikan & Simpan Penerimaan'}
            </Button>
        </PageHeader>
        <ReceivingPoSession 
            poData={activePo}
            receivedItems={receivedItems}
            onAddItem={handleAddItemToSession}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
        />
    </div>
  )
}
