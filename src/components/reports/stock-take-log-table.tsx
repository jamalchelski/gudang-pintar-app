
'use client';

import { useContext, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AppContext } from '@/contexts/app-provider';
import { Skeleton } from '../ui/skeleton';
import { Card } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { StockTakeLog } from '@/lib/types';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { FileText } from 'lucide-react';


export function StockTakeLogTable() {
  const { stockTakeLogs, loading } = useContext(AppContext);
  const [selectedLog, setSelectedLog] = useState<StockTakeLog | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewDetails = (log: StockTakeLog) => {
    setSelectedLog(log);
    setIsDialogOpen(true);
  };

  if (loading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <>
      <Card>
        <ScrollArea className="h-[70vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Items Counted</TableHead>
                <TableHead className="text-right">Total Variance</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockTakeLogs.length > 0 ? (
                stockTakeLogs.map(log => {
                  const totalVariance = log.details.reduce((sum, item) => sum + item.variance, 0);
                  return (
                    <TableRow key={log.id}>
                      <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell className="text-right">{log.details.length}</TableCell>
                      <TableCell className={cn(
                        "text-right font-bold",
                        totalVariance > 0 && "text-green-600",
                        totalVariance < 0 && "text-destructive",
                      )}>
                        {totalVariance > 0 ? `+${totalVariance}` : totalVariance}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(log)}>
                          <FileText className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Tidak ada data stock take.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
      {selectedLog && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Detail Stock Take</DialogTitle>
              <DialogDescription>
                Dilakukan oleh {selectedLog.user} pada {new Date(selectedLog.timestamp).toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh]">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead className="text-right">System Qty</TableHead>
                            <TableHead className="text-right">Counted Qty</TableHead>
                            <TableHead className="text-right">Variance</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {selectedLog.details.map(item => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-sm text-muted-foreground">{item.brand} ({item.id})</div>
                                </TableCell>
                                <TableCell className="text-right">{item.systemQty}</TableCell>
                                <TableCell className="text-right">{item.countedQty}</TableCell>
                                <TableCell className={cn(
                                    "text-right font-bold",
                                    item.variance > 0 && "text-green-600",
                                    item.variance < 0 && "text-destructive"
                                )}>
                                    {item.variance > 0 ? `+${item.variance}` : item.variance}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
