import { useQuery } from "@tanstack/react-query";
import { tradeService } from "@/lib/tradeService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Trade } from "@shared/schema";
import { BarChart3, TrendingUp, AlertTriangle, ThumbsUp, Lightbulb } from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ScatterChart, Scatter } from 'recharts';

export default function Analytics() {
  // Get all trades
  const { data: tradesResponse, isLoading: tradesLoading } = useQuery({
    queryKey: ["trades"],
    queryFn: () => tradeService.getTrades(),
  });

  const trades = tradesResponse?.data?.trades || [];

  console.log('🔍 Analytics: tradesResponse structure:', tradesResponse);
  console.log('🔍 Analytics: extracted trades:', trades);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getMarketConditionPerformance = () => {
    // Mock market condition analysis
    return [
      { condition: "Low Volatility", pnl: 18.4, color: "status-positive" },
      { condition: "Medium Volatility", pnl: 8.2, color: "text-yellow-400" },
      { condition: "High Volatility", pnl: -5.1, color: "status-negative" },
    ];
  };

  // Calculate stats from trades
  const calculateStats = () => {
    if (!trades || trades.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        winRate: 0,
        totalPnL: 0,
        avgWin: 0,
        avgLoss: 0,
        avgTrade: 0,
      };
    }

    const winningTrades = trades.filter(trade => (trade.pnl || 0) > 0);
    const losingTrades = trades.filter(trade => (trade.pnl || 0) < 0);
    const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const avgWin = winningTrades.length > 0 
      ? winningTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0) / winningTrades.length 
      : 0;
    const avgLoss = losingTrades.length > 0 
      ? Math.abs(losingTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0) / losingTrades.length)
      : 0;

    return {
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      winRate: trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0,
      totalPnL,
      avgWin,
      avgLoss,
      avgTrade: trades.length > 0 ? totalPnL / trades.length : 0,
    };
  };

  const stats = calculateStats();

  const getAIInsights = () => {
    if (stats.totalTrades < 5) {
      return [
        {
          type: "info",
          icon: Lightbulb,
          title: "Getting Started",
          message: "Log more trades to receive AI-powered insights and pattern recognition.",
          color: "text-electric-blue",
        },
      ];
    }

    const insights = [];
    
    if (stats.winRate < 50) {
      insights.push({
        type: "warning",
        icon: AlertTriangle,
        title: "Win Rate Alert",
        message: "Your win rate is below 50%. Consider reviewing your entry strategy and risk management.",
        color: "text-yellow-500",
      });
    }

    if (stats.winRate > 70) {
      insights.push({
        type: "positive",
        icon: ThumbsUp,
        title: "Excellent Performance",
        message: `Your win rate of ${stats.winRate.toFixed(1)}% is exceptional. Consider increasing position sizes.`,
        color: "text-green-500",
      });
    }

    if (stats.avgWin && stats.avgLoss && stats.avgWin / stats.avgLoss < 1.5) {
      insights.push({
        type: "optimization",
        icon: Lightbulb,
        title: "Risk/Reward Optimization",
        message: "Your risk-to-reward ratio could be improved. Aim for 1:2 or better on new trades.",
        color: "text-electric-blue",
      });
    }

    return insights.length > 0 ? insights : [
      {
        type: "positive",
        icon: ThumbsUp,
        title: "Strong Performance",
        message: "Your trading metrics look healthy. Keep following your strategy consistently.",
        color: "text-green-500",
      },
    ];
  };

  // Generate advanced chart data
  const generateRiskRewardScatterData = () => {
    if (!trades || trades.length === 0) {
      return [];
    }

    return trades.map(trade => {
      const risk = Math.abs(trade.entryPrice - ((trade.exitPrice || trade.entryPrice) * 0.95));
      const reward = trade.pnl || 0;
      return {
        risk,
        reward,
        symbol: trade.symbol,
        fill: reward >= 0 ? '#00D1FF' : '#FF6B6B'
      };
    });
  };

  const generateMonthlyPerformanceData = () => {
    if (!trades || trades.length === 0) {
      return [];
    }

    const monthlyData = trades.reduce((acc: any, trade) => {
      const date = new Date(trade.createdAt || Date.now());
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = { 
          month: monthKey, 
          trades: 0, 
          winningTrades: 0, 
          pnl: 0,
          winRate: 0
        };
      }
      
      acc[monthKey].trades += 1;
      acc[monthKey].pnl += trade.pnl || 0;
      if ((trade.pnl || 0) > 0) {
        acc[monthKey].winningTrades += 1;
      }
      
      return acc;
    }, {});

    return Object.values(monthlyData).map((month: any) => ({
      ...month,
      winRate: month.trades > 0 ? (month.winningTrades / month.trades) * 100 : 0
    }));
  };

  const generateMarketConditionData = () => {
    return [
      { condition: "Trending", pnl: 24.7, trades: 15, winRate: 73.3, color: '#00D1FF' },
      { condition: "Ranging", pnl: -3.2, trades: 12, winRate: 41.7, color: '#7B2DFF' },
      { condition: "Volatile", pnl: 18.9, trades: 8, winRate: 62.5, color: '#00FFB3' },
      { condition: "Consolidating", pnl: 5.4, trades: 6, winRate: 50.0, color: '#FFB800' }
    ];
  };

  return (
    <div className="min-h-screen bg-dark-navy text-white pt-20">
      <div className="floating-elements"></div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Analytics Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Analytics Hub</h1>
            <p className="text-gray-300">Deep dive into your trading performance</p>
          </div>
          
          {/* Analytics Filters */}
          <div className="flex flex-wrap gap-3">
            <Select defaultValue="all-time">
              <SelectTrigger className="bg-darker-surface border-gray-600 text-white" data-testid="select-timeframe">
                <SelectValue placeholder="All Timeframes" />
              </SelectTrigger>
              <SelectContent className="glass-morphism border-gray-600">
                <SelectItem value="all-time">All Time</SelectItem>
                <SelectItem value="7-days">Last 7 days</SelectItem>
                <SelectItem value="30-days">Last 30 days</SelectItem>
                <SelectItem value="90-days">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all-instruments">
              <SelectTrigger className="bg-darker-surface border-gray-600 text-white" data-testid="select-instruments">
                <SelectValue placeholder="All Instruments" />
              </SelectTrigger>
              <SelectContent className="glass-morphism border-gray-600">
                <SelectItem value="all-instruments">All Instruments</SelectItem>
                <SelectItem value="stocks">Stocks</SelectItem>
                <SelectItem value="options">Options</SelectItem>
                <SelectItem value="crypto">Crypto</SelectItem>
              </SelectContent>
            </Select>
            <Button className="btn-primary" data-testid="button-apply-filters">Apply Filters</Button>
          </div>
        </div>

        {/* Advanced Analytics Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Risk/Reward Scatter Plot */}
          <Card className="glass-morphism border-gray-600">
            <CardHeader>
              <CardTitle className="text-xl">Risk vs Reward Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={generateRiskRewardScatterData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="risk" 
                      stroke="#9CA3AF"
                      fontSize={12}
                      name="Risk"
                      tickFormatter={(value) => `$${value.toFixed(0)}`}
                    />
                    <YAxis 
                      dataKey="reward"
                      stroke="#9CA3AF"
                      fontSize={12}
                      name="Reward"
                      tickFormatter={(value) => `$${value.toFixed(0)}`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                      formatter={(value: any, name: string) => [
                        `$${value.toFixed(2)}`,
                        name === 'risk' ? 'Risk Amount' : 'Reward Amount'
                      ]}
                    />
                    <Scatter
                      dataKey="reward"
                      fill="#00D1FF"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Performance by Market Conditions */}
          <Card className="glass-morphism border-gray-600">
            <CardHeader>
              <CardTitle className="text-xl">Performance by Market Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={generateMarketConditionData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="condition" 
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                      formatter={(value: any, name: string) => [
                        name === 'pnl' ? `${value.toFixed(1)}%` : 
                        name === 'winRate' ? `${value.toFixed(1)}%` : value,
                        name === 'pnl' ? 'P&L' : 
                        name === 'winRate' ? 'Win Rate' : 'Trades'
                      ]}
                    />
                    <Bar 
                      dataKey="pnl" 
                      fill="#00D1FF"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Performance Trend */}
        <Card className="glass-morphism border-gray-600 mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Monthly Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={generateMonthlyPerformanceData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.9)',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                    formatter={(value: any, name: string) => [
                      name === 'pnl' ? `$${value.toFixed(2)}` :
                      name === 'winRate' ? `${value.toFixed(1)}%` : value,
                      name === 'pnl' ? 'Monthly P&L' :
                      name === 'winRate' ? 'Win Rate' : 'Trades'
                    ]}
                  />
                  <Bar 
                    yAxisId="left"
                    dataKey="pnl" 
                    fill="#00D1FF"
                    opacity={0.7}
                    radius={[2, 2, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="winRate"
                    stroke="#7B2DFF"
                    strokeWidth={3}
                    dot={{ fill: '#7B2DFF', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Trade Analysis Table */}
        <Card className="glass-morphism border-gray-600 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Detailed Trade Analysis</CardTitle>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-electric-blue bg-opacity-20 text-electric-blue border-electric-blue"
                  data-testid="button-winning-trades"
                >
                  Winning Trades
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-gray-400 border-gray-600 hover:bg-gray-700"
                  data-testid="button-losing-trades"
                >
                  Losing Trades
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-gray-400 border-gray-600 hover:bg-gray-700"
                  data-testid="button-all-trades"
                >
                  All Trades
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {tradesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-12 bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            ) : trades.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-600">
                      <TableHead className="text-gray-300">Date</TableHead>
                      <TableHead className="text-gray-300">Symbol</TableHead>
                      <TableHead className="text-gray-300">Type</TableHead>
                      <TableHead className="text-gray-300">Entry</TableHead>
                      <TableHead className="text-gray-300">Exit</TableHead>
                      <TableHead className="text-gray-300">P&L</TableHead>
                      <TableHead className="text-gray-300">Return %</TableHead>
                      <TableHead className="text-gray-300">Mood</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trades.slice(0, 10).map((trade) => (
                      <TableRow key={trade.id} className="border-gray-700 hover:bg-darker-surface" data-testid={`row-trade-${trade.id}`}>
                        <TableCell>{new Date(trade.entryDate).toLocaleDateString()}</TableCell>
                        <TableCell className="font-semibold">{trade.symbol}</TableCell>
                        <TableCell>
                          <Badge variant={trade.type === 'Long' ? 'default' : 'secondary'} className={trade.type === 'Long' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}>
                            {trade.type}
                          </Badge>
                        </TableCell>
                        <TableCell>${trade.entryPrice.toFixed(2)}</TableCell>
                        <TableCell>{trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : '-'}</TableCell>
                        <TableCell className={trade.pnl ? ((trade.pnl || 0) >= 0 ? 'status-positive' : 'status-negative') : ''}>
                          {trade.pnl ? formatCurrency(trade.pnl || 0) : '-'}
                        </TableCell>
                        <TableCell className={trade.returnPercent ? ((trade.returnPercent || 0) >= 0 ? 'status-positive' : 'status-negative') : ''}>
                          {trade.returnPercent ? `${(trade.returnPercent || 0) >= 0 ? '+' : ''}${trade.returnPercent}%` : '-'}
                        </TableCell>
                        <TableCell>
                          {trade.mood ? ['😡', '😟', '😐', '😊', '😌'][trade.mood - 1] : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No trades to analyze yet</p>
                <p className="text-sm text-gray-500">Start logging trades to see detailed analytics</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Insights Panel */}
        <Card className="glass-morphism border-electric-blue">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <span className="gradient-text">AI-Powered Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getAIInsights().map((insight, index) => (
                <Card key={index} className="bg-darker-surface border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-8 h-8 ${insight.color === 'text-yellow-500' ? 'bg-yellow-500' : insight.color === 'text-green-500' ? 'bg-green-500' : 'bg-electric-blue'} rounded-lg flex items-center justify-center`}>
                        <insight.icon className="h-4 w-4 text-white" />
                      </div>
                      <h4 className="font-semibold">{insight.title}</h4>
                    </div>
                    <p className="text-sm text-gray-300" data-testid={`text-insight-${index}`}>
                      {insight.message}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
