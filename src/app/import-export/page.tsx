

'use client';

import { useContext, useRef, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Download, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { AppContext } from '@/contexts/app-provider';
import { useToast } from '@/hooks/use-toast';
import { InventoryItem, UserRole } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle } from '@/components/ui/alert';


export default function ImportExportPage() {
  const { inventory, importInventory, deleteAllData, loading: contextLoading, role } = useContext(AppContext);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExport = (format: 'csv' | 'xlsx') => {
    if (inventory.length === 0) {
      toast({
        title: 'No Data to Export',
        description: 'There is no inventory data to export.',
        variant: 'destructive',
      });
      return;
    }
    const dataToExport = inventory.map(item => ({
        ...item,
        allowedRoles: item.allowedRoles?.join(',')
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
    XLSX.writeFile(workbook, `inventory.${format}`);
  };

  const handleDownloadTemplate = () => {
    const templateData = [{
      id: 'SKU-001',
      name: 'Busi Champion',
      brand: 'Champion',
      category: 'Suku Cadang Mesin',
      unit: 'pcs',
      quantity: 15,
      min_stock: 10,
      max_stock: 50,
      image: 'https://placehold.co/400x400.png',
      allowedRoles: 'teknisi'
    }];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    XLSX.writeFile(workbook, `inventory_template.csv`);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<any>(worksheet);

        // Basic validation
        if (json.length === 0 || !json[0].id || !json[0].name) {
            throw new Error('Invalid file format. Make sure columns like id and name exist.')
        }

        const importedItems: Omit<InventoryItem, 'last_updated'>[] = json.map(row => ({
            id: String(row.id),
            name: String(row.name),
            brand: String(row.brand),
            category: String(row.category),
            unit: String(row.unit),
            quantity: Number(row.quantity),
            min_stock: Number(row.min_stock),
            max_stock: Number(row.max_stock),
            image: String(row.image || 'https://placehold.co/400x400.png'),
            allowedRoles: row.allowedRoles ? String(row.allowedRoles).split(',').map((r: string) => r.trim() as UserRole) : ['teknisi', 'cleaning', 'ipm']
        }));

        const success = await importInventory(importedItems);

        if (success) {
            toast({
                title: 'Import Successful',
                description: `${importedItems.length} items have been imported/updated.`
            })
        }
        // Error toast is handled in the context
      } catch (error: any) {
        toast({
          title: 'Import Failed',
          description: error.message || 'An unexpected error occurred during import.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
         // Reset file input
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsBinaryString(file);
  };
  
  const handleDeleteAllData = async () => {
    setDeleteError('');
    if(!password) {
        setDeleteError('Password is required.');
        return;
    }

    setIsDeleting(true);
    const success = await deleteAllData(password);
    setIsDeleting(false);

    if (success) {
        setIsDeleteDialogOpen(false);
        setPassword('');
        toast({
            title: "Data Reset Successfully",
            description: "All data has been deleted and reset to initial state.",
        })
    } else {
        setDeleteError('Authentication failed. Please check your password and try again.');
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Import / Export Data" />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Import Data</CardTitle>
            <CardDescription>
              Import inventory data from a CSV file. Make sure the file follows the required template format.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Button onClick={() => fileInputRef.current?.click()} disabled={loading || contextLoading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Import from CSV
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            />
            <Button variant="link" className="p-0 h-auto" onClick={handleDownloadTemplate}>Download Template</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
            <CardDescription>
              Export the current inventory data to a CSV file. This includes all item details and stock levels.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Button onClick={() => handleExport('csv')}>
              <Download className="mr-2 h-4 w-4" />
              Export to CSV
            </Button>
          </CardContent>
        </Card>
        
        {role === 'admin' && (
          <Card className="md:col-span-2 border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle/> Danger Zone</CardTitle>
              <CardDescription>
                This action is irreversible. All inventory, category, unit, and log data will be permanently deleted.
              </CardDescription>
            </CardHeader>
            <CardContent>
               <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete All Data
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                       This will permanently delete all data from the database. This action cannot be undone. To confirm, please enter your password.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input 
                            id="password" 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your login password" 
                        />
                    </div>
                    {deleteError && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4"/>
                            <AlertTitle>{deleteError}</AlertTitle>
                        </Alert>
                    )}
                    <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => {setPassword(''); setDeleteError('');}}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAllData} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                        {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                        I understand, delete all data
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
