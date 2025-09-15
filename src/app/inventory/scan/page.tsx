
'use client';

import { useState, useEffect, useRef, useContext } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Html5Qrcode, Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { AppContext } from '@/contexts/app-provider';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/page-header';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Camera, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { InventoryItem } from '@/lib/types';
import { ReduceStockDialog } from '@/components/inventory/reduce-stock-dialog';
import { EditItemDialog } from '@/components/inventory/edit-item-dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function ScanPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scannedItem, setScannedItem] = useState<InventoryItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { inventory, role, addItemToPickingList, pickingList } = useContext(AppContext);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  
  const source = searchParams.get('source');

  const [isItemDialog, setIsItemDialog] = useState(false);
  const [isReduceDialog, setIsReduceDialog] = useState(false);
  const [isEditDialog, setIsEditDialog] = useState(false);
  
  const onScanSuccess = (decodedText: string) => {
    // Prevent multiple dialogs from opening for the same scan
    setScanResult(currentResult => {
        if (currentResult === decodedText) return currentResult;
        
        if (source !== 'retrieval') {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(err => console.error("Failed to stop scanner", err));
            }
        }
        return decodedText;
    });
  };

  const onScanFailure = (errorMessage: string) => {
    // console.warn(`QR Code no longer in view: ${errorMessage}`);
  };

  useEffect(() => {
    const startScanner = async () => {
        // Ensure the element is in the DOM
        if (document.getElementById('qr-reader')) {
            try {
                await Html5Qrcode.getCameras();
                const scanner = new Html5Qrcode('qr-reader', {
                    formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
                });
                scannerRef.current = scanner;
                
                scanner.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 }
                    },
                    onScanSuccess,
                    onScanFailure
                ).catch(err => {
                    setError("Gagal memulai kamera. Pastikan Anda telah memberikan izin kamera.");
                    console.error("Camera start error:", err);
                });
            } catch (err) {
                 setError("Kamera tidak ditemukan atau akses ditolak. Silakan periksa pengaturan browser Anda.");
                 console.error("Camera permission error:", err);
            }
        }
    };
    
    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.error("Failed to stop scanner on cleanup", err));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scanResult) {
      const item = inventory.find(i => i.id === scanResult);
      if (item) {
        setScannedItem(item);
        if (source === 'retrieval') {
            const isItemInList = pickingList.some(plItem => plItem.id === item.id);
             if (isItemInList) {
                toast({
                    title: "Item Sudah Ada di Daftar",
                    description: `${item.name} sudah ada di daftar pengambilan.`,
                    variant: 'destructive'
                });
                 setScanResult(null); // Allow re-scanning the same item if needed
            } else {
                setIsItemDialog(true); // Open confirmation dialog
            }
        } else {
            setIsItemDialog(true);
        }
      } else {
        toast({
          title: 'Item Tidak Ditemukan',
          description: `Tidak ada item inventaris yang cocok dengan SKU: ${scanResult}`,
          variant: 'destructive',
        });
        handleRescan(); // Reset for next scan
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanResult]);

  const handleConfirmAddToPickingList = () => {
    if (scannedItem) {
      addItemToPickingList(scannedItem);
      toast({
        title: "Item Ditambahkan",
        description: `${scannedItem.name} ditambahkan ke daftar pengambilan.`,
      });
    }
    handleCloseAndReset();
  };

  const handleCloseAndReset = () => {
    setIsItemDialog(false);
    setScannedItem(null);
    setScanResult(null);
  };

  const handleRescan = () => {
    handleCloseAndReset();
    if (scannerRef.current && !scannerRef.current.isScanning && source !== 'retrieval') {
        scannerRef.current.start(
             { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 }},
            onScanSuccess,
            onScanFailure
        ).catch(() => {
            setError("Gagal memulai ulang pemindai.")
        })
    }
  }


  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Pindai QR Code Item">
         <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
             <div id="qr-reader" className="w-full"></div>
             {error && (
                <Alert variant="destructive" className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Kamera</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
             {!error && (
                 <Alert className="mt-4">
                    <Camera className="h-4 w-4" />
                    <AlertTitle>Arahkan ke QR Code</AlertTitle>
                    <AlertDescription>
                         {source === 'retrieval' 
                            ? 'Pindai item untuk menambahkannya ke daftar pengambilan.'
                            : 'Posisikan QR code item di dalam kotak pemindaian.'
                         }
                    </AlertDescription>
                </Alert>
             )}
        </CardContent>
      </Card>


      {scannedItem && (
        <>
            <Dialog open={isItemDialog} onOpenChange={(open) => { if(!open) handleCloseAndReset()}}>
                <DialogContent onInteractOutside={(e) => { e.preventDefault(); handleCloseAndReset(); }} onEscapeKeyDown={handleCloseAndReset}>
                <DialogHeader>
                    <DialogTitle>Item Ditemukan: {scannedItem.name}</DialogTitle>
                    <DialogDescription>SKU: {scannedItem.id}</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <p><strong>Merek:</strong> {scannedItem.brand}</p>
                    <p><strong>Kategori:</strong> {scannedItem.category}</p>
                    <p><strong>Kuantitas Saat Ini:</strong> {scannedItem.quantity} {scannedItem.unit}</p>
                </div>
                {source === 'retrieval' ? (
                     <DialogFooter className="sm:justify-between flex-col-reverse sm:flex-row gap-2">
                         <Button variant="outline" onClick={handleCloseAndReset}>
                            Batal
                        </Button>
                        <Button onClick={handleConfirmAddToPickingList}>Ya, Tambahkan</Button>
                    </DialogFooter>
                ) : (
                    <DialogFooter className="sm:justify-between flex-col-reverse sm:flex-row gap-2">
                        <Button variant="outline" onClick={handleRescan}>
                            Pindai Lagi
                        </Button>
                        <div className="flex gap-2 justify-end">
                            {role === 'admin' && (
                                <Button variant="outline" onClick={() => { setIsItemDialog(false); setIsEditDialog(true); }}>Edit Item</Button>
                            )}
                            <Button onClick={() => { setIsItemDialog(false); setIsReduceDialog(true); }}>Kurangi Stok</Button>
                        </div>
                    </DialogFooter>
                )}
                </DialogContent>
            </Dialog>

            <ReduceStockDialog 
                isOpen={isReduceDialog}
                setIsOpen={setIsReduceDialog}
                item={scannedItem}
                onClose={handleRescan}
            />

            {role === 'admin' && (
                <EditItemDialog 
                    isOpen={isEditDialog}
                    setIsOpen={setIsEditDialog}
                    item={scannedItem}
                    onClose={handleRescan}
                />
            )}
        </>
      )}
    </div>
  );
}
