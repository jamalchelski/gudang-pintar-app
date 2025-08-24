'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Download, CheckCircle } from 'lucide-react';
import { StockTakeTable } from '@/components/inventory/stock-take-table';

export default function StockTakePage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Stock Take">
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
        <Button>
          <CheckCircle className="mr-2 h-4 w-4" />
          Submit Counts
        </Button>
      </PageHeader>
      <p className="text-muted-foreground">
        Perform a physical inventory count. Enter the counted quantity for each item and submit to update stock levels.
      </p>
      <StockTakeTable />
    </div>
  );
}
