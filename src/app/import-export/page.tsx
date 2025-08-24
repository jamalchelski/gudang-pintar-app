
'use client';

import { useContext, useRef, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Download, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { AppContext } from '@/contexts/app-provider';
import { useToast } from '@/hooks/use-toast';
import { InventoryItem } from '@/lib/types';

export default function ImportExportPage() {
  const { inventory, importInventory, loading: contextLoading } = useContext(AppContext);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleExport = (format: 'csv' | 'xlsx') => {
    if (inventory.length === 0) {
      toast({
        title: 'No Data to Export',
        description: 'There is no inventory data to export.',
        variant: 'destructive',
      });
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(inventory);
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
      image: 'https://placehold.co/400x400.png'
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
            image: String(row.image || 'https://placehold.co/400x400.png')
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
          <CardContent className="flex flex-col gap-4 sm:flex-row">
            <Button className="w-full sm:w-auto" onClick={() => fileInputRef.current?.click()} disabled={loading || contextLoading}>
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
          <CardContent className="flex flex-col gap-4 sm:flex-row">
            <Button className="w-full sm:w-auto" onClick={() => handleExport('csv')}>
              <Download className="mr-2 h-4 w-4" />
              Export to CSV
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
