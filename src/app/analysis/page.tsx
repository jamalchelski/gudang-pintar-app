
'use client';

import { useState, useContext } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, BrainCircuit, AlertTriangle, PackageX, PackageCheck, TrendingUp, Zap } from 'lucide-react';
import { AppContext } from '@/contexts/app-provider';
import { analyzeStock, StockAnalysis } from '@/ai/flows/analyze-stock-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';


export default function AnalysisPage() {
  const { inventory, role, retrievalLogs } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<StockAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      // Filter logs to only include relevant data to minimize token usage
      const filteredLogs = retrievalLogs.map(log => ({
        itemId: log.itemId,
        quantityRetrieved: log.quantityRetrieved,
        timestamp: log.timestamp,
      }));

      const result = await analyzeStock({
        inventory: inventory,
        retrievalLogs: filteredLogs
      });
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      setError('An error occurred while analyzing the stock. Please try again.');
    }
    setLoading(false);
  };
  
  if (role !== 'admin') {
      return (
           <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>You do not have permission to view this page.</AlertDescription>
            </Alert>
      )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="AI Stock Analysis">
        <Button onClick={handleAnalyze} disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <BrainCircuit className="mr-2 h-4 w-4" />
          )}
          {loading ? 'Analyzing...' : 'Analyze Full Inventory'}
        </Button>
      </PageHeader>
      
      {!analysis && !loading && (
        <Card className="text-center py-12">
            <CardHeader>
                <CardTitle className="text-2xl">Ready to Gain Insights?</CardTitle>
                <CardDescription>Click the button above to start the AI analysis of your current inventory and retrieval history. The process may take a moment.</CardDescription>
            </CardHeader>
             <CardContent>
                <BrainCircuit className="h-16 w-16 mx-auto text-muted-foreground" />
            </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Analysis Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {analysis && (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{analysis.executiveSummary}</p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Zap className="text-blue-500" /> Fast-Moving Items</CardTitle>
                <CardDescription>Items with the highest demand based on retrieval history.</CardDescription>
              </CardHeader>
              <CardContent>
                 <ul className="space-y-2">
                    {analysis.fastMovingItems.map(item => (
                        <li key={item.id} className="text-sm">
                            <span className="font-semibold">{item.name}</span> ({item.id}) - <span className="font-bold">{item.totalRetrieved}</span> units taken
                        </li>
                    ))}
                    {analysis.fastMovingItems.length === 0 && <p className="text-sm text-muted-foreground">No retrieval data to analyze.</p>}
                 </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="text-primary" /> Overstocked Items</CardTitle>
                <CardDescription>Items with excess inventory compared to their maximum stock level.</CardDescription>
              </CardHeader>
              <CardContent>
                 <ul className="space-y-2">
                    {analysis.overstockedItems.map(item => (
                        <li key={item.id} className="text-sm">
                            <span className="font-semibold">{item.name}</span> ({item.id}) - <span className="font-bold">{item.quantity}</span> units (Max: {item.max_stock})
                        </li>
                    ))}
                    {analysis.overstockedItems.length === 0 && <p className="text-sm text-muted-foreground">No overstocked items found.</p>}
                 </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-amber-500" /> Understocked Items</CardTitle>
                 <CardDescription>Items below their minimum stock level that need reordering.</CardDescription>
              </CardHeader>
              <CardContent>
                 <ul className="space-y-2">
                    {analysis.understockedItems.map(item => (
                        <li key={item.id} className="text-sm">
                           <span className="font-semibold">{item.name}</span> ({item.id}) - <span className="font-bold">{item.quantity}</span> units (Min: {item.min_stock})
                        </li>
                    ))}
                    {analysis.understockedItems.length === 0 && <p className="text-sm text-muted-foreground">No understocked items found.</p>}
                 </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><PackageX className="text-destructive" /> Potential Dead Stock</CardTitle>
                 <CardDescription>Items with no recorded movement recently that may be obsolete.</CardDescription>
              </CardHeader>
              <CardContent>
                 <ul className="space-y-2">
                    {analysis.deadStock.map(item => (
                        <li key={item.id} className="text-sm">
                            <span className="font-semibold">{item.name}</span> ({item.id}) - Last updated {new Date(item.last_updated).toLocaleDateString()}
                        </li>
                    ))}
                    {analysis.deadStock.length === 0 && <p className="text-sm text-muted-foreground">No potential dead stock identified.</p>}
                 </ul>
              </CardContent>
            </Card>
          </div>

           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><PackageCheck /> Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                {analysis.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
