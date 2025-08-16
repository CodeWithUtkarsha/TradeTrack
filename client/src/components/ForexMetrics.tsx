import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPips } from '@/lib/forexCalculations';
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';

interface ForexMetricsProps {
  trades: any[];
}

export function ForexMetrics({ trades }: ForexMetricsProps) {
  const forexTrades = trades.filter(trade => 
    trade.pips !== undefined && trade.pips !== null
  );

  if (forexTrades.length === 0) {
    return null;
  }

  const totalPips = forexTrades.reduce((sum, trade) => sum + (trade.pips || 0), 0);
  const avgPipsPerTrade = forexTrades.length > 0 ? totalPips / forexTrades.length : 0;
  
  const winningTrades = forexTrades.filter(trade => trade.pips > 0);
  const losingTrades = forexTrades.filter(trade => trade.pips <= 0);
  
  const avgWinningPips = winningTrades.length > 0 
    ? winningTrades.reduce((sum, trade) => sum + trade.pips, 0) / winningTrades.length 
    : 0;
    
  const avgLosingPips = losingTrades.length > 0 
    ? losingTrades.reduce((sum, trade) => sum + trade.pips, 0) / losingTrades.length 
    : 0;

  const largestWinPips = winningTrades.length > 0 
    ? Math.max(...winningTrades.map(trade => trade.pips)) 
    : 0;
    
  const largestLossPips = losingTrades.length > 0 
    ? Math.min(...losingTrades.map(trade => trade.pips)) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card className="glass-morphism border-gray-600">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Total Pips</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${totalPips >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatPips(totalPips)}
          </div>
          <p className="text-xs text-muted-foreground">
            Avg: {formatPips(avgPipsPerTrade)}
          </p>
        </CardContent>
      </Card>

      <Card className="glass-morphism border-gray-600">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Average Win</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-400">
            {formatPips(avgWinningPips)}
          </div>
          <p className="text-xs text-muted-foreground">
            Best: {formatPips(largestWinPips)}
          </p>
        </CardContent>
      </Card>

      <Card className="glass-morphism border-gray-600">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Average Loss</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-400">
            {formatPips(avgLosingPips)}
          </div>
          <p className="text-xs text-muted-foreground">
            Worst: {formatPips(largestLossPips)}
          </p>
        </CardContent>
      </Card>

      <Card className="glass-morphism border-gray-600">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">Forex Trades</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-300">
            {forexTrades.length}
          </div>
          <p className="text-xs text-muted-foreground">
            {winningTrades.length}W / {losingTrades.length}L
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
