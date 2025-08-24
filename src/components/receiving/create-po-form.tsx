
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export interface PoData {
  poNumber: string;
  vendor: string;
}

interface CreatePoFormProps {
  onFormSubmit: (data: PoData) => void;
}

export function CreatePoForm({ onFormSubmit }: CreatePoFormProps) {
  const [poNumber, setPoNumber] = useState('');
  const [vendor, setVendor] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (poNumber.trim() && vendor.trim()) {
      onFormSubmit({ poNumber, vendor });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
        <Card className="max-w-lg">
            <CardHeader>
                <CardTitle>Buat Sesi Penerimaan Baru</CardTitle>
                <CardDescription>Masukkan detail di bawah untuk memulai.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="poNumber">Nomor Purchase Order (PO)</Label>
                <Input
                    id="poNumber"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    placeholder="Contoh: PO-2024-123"
                    required
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="vendor">Nama Vendor</Label>
                <Input
                    id="vendor"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    placeholder="Contoh: PT Suku Cadang Sejahtera"
                    required
                />
                </div>
            </CardContent>
            <CardFooter>
                 <Button type="submit" disabled={!poNumber.trim() || !vendor.trim()}>
                    Mulai Sesi Penerimaan
                </Button>
            </CardFooter>
        </Card>
    </form>
  );
}

