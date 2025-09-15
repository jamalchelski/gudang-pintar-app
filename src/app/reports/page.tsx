
'use client';

import { PageHeader } from '@/components/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RetrievalLogTable } from '@/components/reports/retrieval-log-table';
import { IncomingLogTable } from '@/components/reports/incoming-log-table';
import { StockTakeLogTable } from '@/components/reports/stock-take-log-table';

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Laporan Transaksi" />
      <Tabs defaultValue="retrieval">
        <TabsList>
          <TabsTrigger value="retrieval">Pengambilan</TabsTrigger>
          <TabsTrigger value="incoming">Barang Masuk</TabsTrigger>
          <TabsTrigger value="stock-take">Stock Take</TabsTrigger>
        </TabsList>
        <TabsContent value="retrieval" className="mt-4">
          <RetrievalLogTable />
        </TabsContent>
        <TabsContent value="incoming" className="mt-4">
          <IncomingLogTable />
        </TabsContent>
        <TabsContent value="stock-take" className="mt-4">
          <StockTakeLogTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
