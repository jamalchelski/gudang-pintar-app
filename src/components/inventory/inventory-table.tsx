
'use client';

import React, { useState, useContext, useMemo } from 'react';
import Image from 'next/image';
import QRCode from 'react-qr-code';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { InventoryItem } from '@/lib/types';
import { AppContext } from '@/contexts/app-provider';
import { MoreHorizontal, Pencil, Trash2, QrCode as QrCodeIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ReduceStockDialog } from './reduce-stock-dialog';
import { EditItemDialog } from './edit-item-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface InventoryTableProps {
  data: InventoryItem[];
}

export function InventoryTable({ data }: InventoryTableProps) {
  const [filter, setFilter] = useState('');
  const { role, deleteItem } = useContext(AppContext);
  const [reduceStockDialogOpen, setReduceStockDialogOpen] = useState(false);
  const [editItemDialogOpen, setEditItemDialogOpen] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const filteredData = useMemo(() => {
    if (!filter) return data;
    return data.filter(
      item =>
        item.name.toLowerCase().includes(filter.toLowerCase()) ||
        item.brand.toLowerCase().includes(filter.toLowerCase()) ||
        item.category.toLowerCase().includes(filter.toLowerCase()) ||
        item.id.toLowerCase().includes(filter.toLowerCase())
    );
  }, [data, filter]);

  const handleActionClick = (item: InventoryItem, action: 'reduce' | 'edit' | 'delete' | 'qrcode') => {
    setSelectedItem(item);
    if (action === 'reduce') {
      setReduceStockDialogOpen(true);
    } else if (action === 'edit') {
      setEditItemDialogOpen(true);
    } else if (action === 'delete') {
      setDeleteConfirmationOpen(true);
    } else if (action === 'qrcode') {
        setQrCodeDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedItem) {
        await deleteItem(selectedItem.id);
        setDeleteConfirmationOpen(false);
        setSelectedItem(null);
    }
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (item.quantity < item.min_stock) return <Badge variant="secondary" className="bg-amber-100 text-amber-800">Low Stock</Badge>;
    return <Badge variant="secondary">In Stock</Badge>;
  };

  return (
    <>
    <div className="bg-card rounded-lg shadow-sm">
      <div className="p-4 flex gap-2">
        <Input
          placeholder="Cari item berdasarkan nama, SKU, dll..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="max-w-sm"
        />
        <Button asChild variant="outline" size="icon">
          <Link href="/inventory/scan">
            <QrCodeIcon className="h-4 w-4"/>
            <span className="sr-only">Pindai QR Code</span>
          </Link>
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] hidden sm:table-cell">Image</TableHead>
              <TableHead>Item Name</TableHead>
              <TableHead className="hidden md:table-cell">SKU</TableHead>
              <TableHead className="hidden lg:table-cell">Category</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={40}
                      height={40}
                      className="rounded-md object-cover"
                      data-ai-hint="spare part"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.brand}</div>
                  </TableCell>
                  <TableCell className="font-mono text-xs hidden md:table-cell">{item.id}</TableCell>
                  <TableCell className="hidden lg:table-cell">{item.category}</TableCell>
                  <TableCell className="text-right">
                    <span className="font-bold">{item.quantity}</span>
                    <span className="text-muted-foreground"> {item.unit}</span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{getStockStatus(item)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                         <DropdownMenuItem onClick={() => handleActionClick(item, 'qrcode')}>
                            <QrCodeIcon className="mr-2 h-4 w-4" />
                            QR Code
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleActionClick(item, 'reduce')}>
                          Reduce Stock
                        </DropdownMenuItem>
                        {role === 'admin' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleActionClick(item, 'edit')}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Item
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleActionClick(item, 'delete')}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Item
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
    
      {selectedItem && (
        <ReduceStockDialog
          isOpen={reduceStockDialogOpen}
          setIsOpen={setReduceStockDialogOpen}
          item={selectedItem}
        />
      )}
       {selectedItem && role === 'admin' && (
        <EditItemDialog
          isOpen={editItemDialogOpen}
          setIsOpen={setEditItemDialogOpen}
          item={selectedItem}
        />
      )}
       {selectedItem && role === 'admin' && (
        <AlertDialog open={deleteConfirmationOpen} onOpenChange={setDeleteConfirmationOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the item <strong className="text-foreground">{selectedItem.name}</strong> from your inventory.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setSelectedItem(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
      {selectedItem && (
         <Dialog open={qrCodeDialogOpen} onOpenChange={setQrCodeDialogOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>QR Code for: {selectedItem.name}</DialogTitle>
                    <DialogDescription>
                        SKU: {selectedItem.id}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-center p-4 bg-white rounded-md">
                    <QRCode
                        size={256}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        value={selectedItem.id}
                        viewBox={`0 0 256 256`}
                    />
                </div>
            </DialogContent>
         </Dialog>
      )}
    </>
  );
}
