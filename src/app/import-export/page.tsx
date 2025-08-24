'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Download } from 'lucide-react';

export default function ImportExportPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Import / Export Data" />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Import Data</CardTitle>
            <CardDescription>
              Import inventory data from a CSV or XLSX file. Make sure the file follows the required template format.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row">
            <Button className="w-full sm:w-auto">
              <Upload className="mr-2 h-4 w-4" />
              Import from CSV
            </Button>
            <Button className="w-full sm:w-auto">
              <Upload className="mr-2 h-4 w-4" />
              Import from XLSX
            </Button>
            <Button variant="link" className="p-0 h-auto">Download Template</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
            <CardDescription>
              Export the current inventory data to a CSV or XLSX file. This includes all item details and stock levels.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row">
            <Button className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Export to CSV
            </Button>
            <Button className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Export to XLSX
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
