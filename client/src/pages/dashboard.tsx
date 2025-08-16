import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { auth } from "@/lib/auth";
import { tradeService } from "@/lib/tradeService";
import { formatCurrency } from "@/lib/forexCalculations";
import { ForexMetrics } from "@/components/ForexMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import TradeModal from "@/components/trade-modal";
import type { Trade, User } from "@shared/schema";
import { ChartLine, Target, Calculator, Scale, Brain, TrendingUp } from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

type TimePeriod = '1m' | '3m' | '1y';

export default function Dashboard() {
  // State for time period selection
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('1m');
  
  // Get current user
  const { data: currentUser } = useQuery<User | null>({
    queryKey: ["currentUser"],
    queryFn: auth.getCurrentUser,
  });

  // Get trades with period filter (same approach as Analytics page)
  const { data: tradesData, isLoading: tradesLoading, error: tradesError } = useQuery({
    queryKey: ["trades", selectedPeriod],
    queryFn: async () => {
      console.log('🔍 Dashboard: Fetching trades for period:', selectedPeriod);
      const token = localStorage.getItem('auth_token');
      console.log('🔍 Dashboard: Token exists:', !!token);
      try {
        const result = await tradeService.getTrades({ period: selectedPeriod });
        console.log('✅ Dashboard: Trades result:', result);
        return result;
      } catch (error) {
        console.error('❌ Dashboard: Trades error:', error);
        throw error;
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if it's an authentication error
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 30000,
    onError: (error) => {
      console.error('Trades error:', error);
      // If authentication fails, clear token and redirect to login
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        window.location.href = '/login';
      }
    },
  });

  const trades = tradesData?.data?.trades || [];

  console.log('🔍 Dashboard: Full tradesData:', tradesData);
  console.log('🔍 Dashboard: tradesError:', tradesError);
  console.log('🔍 Dashboard: extracted trades:', trades);

  // Calculate statistics from trades (same as Analytics page approach)
  const calculateStats = (trades: Trade[]) => {
    if (!trades || trades.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        winRate: 0,
        totalPnL: 0,
        avgTrade: 0,
        avgWin: 0,
        avgLoss: 0,
        profitFactor: 0,
        largestWin: 0,
        largestLoss: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
      };
    }

    const completedTrades = trades.filter(trade => 
      trade.status === 'Closed' || (trade.status === 'Open' && trade.exitPrice && trade.pnl !== null)
    );

    const totalTrades = completedTrades.length;
    const winningTrades = completedTrades.filter(trade => trade.pnl > 0);
    const losingTrades = completedTrades.filter(trade => trade.pnl <= 0);
    
    const totalPnL = completedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
    const avgTrade = totalTrades > 0 ? totalPnL / totalTrades : 0;
    
    const avgWin = winningTrades.length > 0 
      ? winningTrades.reduce((sum, trade) => sum + trade.pnl, 0) / winningTrades.length 
      : 0;
    
    const avgLoss = losingTrades.length > 0 
      ? losingTrades.reduce((sum, trade) => sum + trade.pnl, 0) / losingTrades.length 
      : 0;

    const profitFactor = Math.abs(avgLoss) > 0 ? avgWin / Math.abs(avgLoss) : 0;

    const largestWin = winningTrades.length > 0 
      ? Math.max(...winningTrades.map(trade => trade.pnl)) 
      : 0;
    
    const largestLoss = losingTrades.length > 0 
      ? Math.min(...losingTrades.map(trade => trade.pnl)) 
      : 0;

    return {
      totalTrades,
      winningTrades: winningTrades.length,
      winRate,
      totalPnL,
      avgTrade,
      avgWin,
      avgLoss,
      profitFactor,
      largestWin,
      largestLoss,
      maxDrawdown: 0, // TODO: Calculate max drawdown
      sharpeRatio: 0, // TODO: Calculate Sharpe ratio
    };
  };

  const stats = calculateStats(trades);
  console.log('🔍 Dashboard: calculated stats:', stats);

  // Show error state if trades query fails
  const hasError = tradesError;
  const statsLoading = tradesLoading;

  // Use calculated stats directly
  const displayStats = {
    totalTrades: stats.totalTrades,
    winningTrades: stats.winningTrades,
    winRate: stats.winRate,
    totalPnL: stats.totalPnL,
    avgTrade: stats.avgTrade,
    avgWin: stats.avgWin,
    avgLoss: stats.avgLoss,
    profitFactor: stats.profitFactor,
    largestWin: stats.largestWin,
    largestLoss: stats.largestLoss,
    maxDrawdown: stats.maxDrawdown,
    sharpeRatio: stats.sharpeRatio,
  };

  const recentTrades = trades.slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Generate chart data using trades data
  const generatePnLChartData = () => {
    if (!trades || trades.length === 0) {
      // Return empty data for the selected period
      const now = new Date();
      const data = [];
      
      if (selectedPeriod === '1m') {
        // Last 30 days
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          data.push({
            date: date.toLocaleDateString(),
            pnl: 0,
            cumulative: 0
          });
        }
      } else if (selectedPeriod === '3m') {
        // Last 12 weeks
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - (i * 7));
          data.push({
            date: `Week ${12 - i}`,
            pnl: 0,
            cumulative: 0
          });
        }
      } else { // 1y
        // Last 12 months
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - i);
          data.push({
            date: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            pnl: 0,
            cumulative: 0
          });
        }
      }
      return data;
    }

    // Create chart data from actual trades
    const completedTrades = trades.filter(trade => 
      trade.status === 'Closed' || (trade.status === 'Open' && trade.exitDate && trade.pnl !== null)
    ).sort((a, b) => new Date(a.exitDate || a.entryDate).getTime() - new Date(b.exitDate || b.entryDate).getTime());

    let cumulative = 0;
    const chartData = completedTrades.map(trade => {
      cumulative += trade.pnl || 0;
      return {
        date: new Date(trade.exitDate || trade.entryDate).toLocaleDateString(),
        pnl: trade.pnl || 0,
        cumulative: cumulative
      };
    });

    return chartData;
  };

  const generateWinLossData = () => {
    const wins = displayStats.winningTrades || 0;
    const losses = (displayStats.totalTrades || 0) - wins;
    
    return [
      { name: 'Wins', value: wins, color: '#00D1FF' },
      { name: 'Losses', value: losses, color: '#FF6B6B' },
    ];
  };

  const generateTradesBySymbolData = () => {
    if (!trades || trades.length === 0) {
      return [];
    }

    const symbolData = trades.reduce((acc: any, trade) => {
      if (!acc[trade.symbol]) {
        acc[trade.symbol] = { symbol: trade.symbol, trades: 0, pnl: 0, wins: 0 };
      }
      acc[trade.symbol].trades += 1;
      acc[trade.symbol].pnl += trade.pnl || 0;
      if (trade.pnl > 0) acc[trade.symbol].wins += 1;
      return acc;
    }, {});

    return Object.values(symbolData)
      .sort((a: any, b: any) => b.pnl - a.pnl)
      .slice(0, 5); // Top 5 symbols
  };

  return (
    <div className="min-h-screen bg-dark-navy text-white pt-20">
      <div className="floating-elements"></div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Trading Dashboard</h1>
            <p className="text-gray-300">
              Welcome back, {currentUser?.firstName || "Trader"}
            </p>
          </div>
          
          <TradeModal />
        </div>

        {/* Error Alert */}
        {hasError && (
          <Alert className="glass-morphism border-red-500 bg-red-900/20 mb-8">
            <AlertDescription className="text-red-300">
              <strong>Error:</strong> Failed to load dashboard data. 
              {tradesError?.message?.includes('401') 
                ? ' Please log out and log in again with your credentials.'
                : ' Please check your connection and try again.'
              }
              <br />
              <button 
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/login';
                }}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Log Out & Retry
              </button>
            </AlertDescription>
          </Alert>
        )}

        {/* AI Summary Banner */}
        <Alert className="glass-morphism border-electric-blue bg-transparent mb-8">
          <Brain className="h-4 w-4" />
          <AlertDescription className="text-gray-300">
            <strong className="text-electric-blue">AI Insight:</strong> {' '}
            {displayStats?.totalTrades > 5 
              ? `Your win rate of ${formatPercentage(displayStats.winRate)} is ${displayStats.winRate > 60 ? 'above' : 'below'} the industry average. ${displayStats.winRate < 60 ? 'Consider reviewing your risk management strategy.' : 'Keep up the great work!'}`
              : "Start logging more trades to receive personalized AI insights and improve your trading performance."
            }
          </AlertDescription>
        </Alert>

        {/* Forex Metrics */}
        {trades && <ForexMetrics trades={trades} />}

        {/* Dashboard Widgets Grid */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-8">
          {/* Total P&L Widget */}
          <Card className="glass-morphism border-gray-600 hover:border-electric-blue transition-all duration-300 trade-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-lg text-gray-300">
                  Total P&L ({selectedPeriod})
                </CardTitle>
                <ChartLine className="text-electric-blue" />
              </div>
              {statsLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                </div>
              ) : (
                <>
                                    <div className={`text-3xl font-bold mb-2 ${displayStats?.totalPnL >= 0 ? 'status-positive' : 'status-negative'}`} data-testid="text-total-pnl">
                    {formatCurrency(displayStats?.totalPnL || 0)}
                  </div>
                  <div className="text-sm text-gray-400">
                    {displayStats?.totalTrades || 0} total trades
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Win Rate Widget */}
          <Card className="glass-morphism border-gray-600 hover:border-electric-blue transition-all duration-300 trade-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-lg text-gray-300">
                  Win Rate ({selectedPeriod})
                </CardTitle>
                <Target className="text-electric-blue" />
              </div>
              {statsLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-electric-blue mb-2" data-testid="text-win-rate">
                    {formatPercentage(displayStats?.winRate || 0)}
                  </div>
                  <div className="text-sm text-gray-400">
                    {displayStats?.winningTrades || 0} wins / {displayStats?.totalTrades || 0} trades
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Average Trade Widget */}
          <Card className="glass-morphism border-gray-600 hover:border-electric-blue transition-all duration-300 trade-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-lg text-gray-300">
                  Avg Trade ({selectedPeriod})
                </CardTitle>
                <Calculator className="text-electric-blue" />
              </div>
              {statsLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-white mb-2" data-testid="text-avg-trade">
                    {formatCurrency(displayStats?.avgTrade || 0)}
                  </div>
                  <div className="text-sm text-gray-400">Per trade</div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Win/Loss Ratio Widget */}
          <Card className="glass-morphism border-gray-600 hover:border-electric-blue transition-all duration-300 trade-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-lg text-gray-300">
                  Avg Win/Loss ({selectedPeriod})
                </CardTitle>
                <Scale className="text-electric-blue" />
              </div>
              {statsLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-cyber-purple mb-2" data-testid="text-win-loss-ratio">
                    {displayStats?.avgWin && displayStats?.avgLoss 
                      ? `1:${(displayStats.avgWin / displayStats.avgLoss).toFixed(1)}`
                      : "N/A"
                    }
                  </div>
                  <div className="text-sm text-gray-400">Risk/Reward ratio</div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* P&L Performance Chart */}
          <Card className="lg:col-span-2 glass-morphism border-gray-600">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Portfolio Performance</CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedPeriod('1m')}
                    className={selectedPeriod === '1m' 
                      ? "bg-electric-blue bg-opacity-20 text-electric-blue border-electric-blue" 
                      : "text-gray-400 border-gray-600 hover:bg-gray-700"
                    }
                  >
                    1M
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedPeriod('3m')}
                    className={selectedPeriod === '3m' 
                      ? "bg-electric-blue bg-opacity-20 text-electric-blue border-electric-blue" 
                      : "text-gray-400 border-gray-600 hover:bg-gray-700"
                    }
                  >
                    3M
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedPeriod('1y')}
                    className={selectedPeriod === '1y' 
                      ? "bg-electric-blue bg-opacity-20 text-electric-blue border-electric-blue" 
                      : "text-gray-400 border-gray-600 hover:bg-gray-700"
                    }
                  >
                    1Y
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={generatePnLChartData()}>
                    <defs>
                      <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00D1FF" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00D1FF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                      formatter={(value: any, name: string) => [
                        name === 'cumulative' ? `$${value.toFixed(2)}` : `$${value.toFixed(2)}`,
                        name === 'cumulative' ? 'Total P&L' : 'Monthly P&L'
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="cumulative"
                      stroke="#00D1FF"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#pnlGradient)"
                    />
                    <Line
                      type="monotone"
                      dataKey="pnl"
                      stroke="#7B2DFF"
                      strokeWidth={1}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Trades */}
          <Card className="glass-morphism border-gray-600">
            <CardHeader>
              <CardTitle className="text-xl">Recent Trades</CardTitle>
            </CardHeader>
            <CardContent>
              {tradesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-700 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : recentTrades.length > 0 ? (
                <div className="space-y-4">
                  {recentTrades.map((trade) => (
                    <Card key={trade.id} className="bg-darker-surface border-gray-700">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold" data-testid={`text-symbol-${trade.id}`}>
                              {trade.symbol}
                            </div>
                            <div className="text-sm text-gray-400">
                              {trade.type} • {new Date(trade.createdAt!).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            {trade.pnl && (
                              <>
                                <div className={`font-semibold ${(trade.pnl || 0) >= 0 ? 'status-positive' : 'status-negative'}`} data-testid={`text-pnl-${trade.id}`}>
                                  {(trade.pnl || 0) >= 0 ? '+' : ''}{formatCurrency(trade.pnl || 0)}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {trade.returnPercent && `${(trade.returnPercent || 0) >= 0 ? '+' : ''}${trade.returnPercent}%`}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ChartLine className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No trades logged yet</p>
                  <TradeModal>
                    <Button className="btn-primary" data-testid="button-log-first-trade">
                      Log Your First Trade
                    </Button>
                  </TradeModal>
                </div>
              )}
              
              {recentTrades.length > 0 && (
                <Button variant="link" className="w-full mt-4 text-electric-blue hover:text-cyber-purple" data-testid="link-view-all-trades">
                  View All Trades
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          {/* Win/Loss Pie Chart */}
          <Card className="glass-morphism border-gray-600">
            <CardHeader>
              <CardTitle className="text-xl">Win/Loss Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={generateWinLossData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {generateWinLossData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ color: '#F9FAFB' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Symbols Performance */}
          <Card className="glass-morphism border-gray-600">
            <CardHeader>
              <CardTitle className="text-xl">Top Symbols Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={generateTradesBySymbolData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="symbol" 
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={12}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                      formatter={(value: any, name: string) => [
                        name === 'pnl' ? `$${value.toFixed(2)}` : value,
                        name === 'pnl' ? 'Total P&L' : 'Trade Count'
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

        {/* Trading Heatmap Matrix */}
        <Card className="mt-6 glass-morphism border-gray-600">
          <CardHeader>
            <CardTitle className="text-xl">Performance Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-12 gap-1 max-w-4xl mx-auto">
              {Array.from({ length: 84 }).map((_, i) => {
                const weekDay = i % 7;
                const week = Math.floor(i / 7);
                const intensity = Math.random();
                const profit = Math.random() > 0.5;
                
                return (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-sm transition-all duration-200 hover:scale-110 cursor-pointer ${
                      intensity > 0.8 
                        ? profit ? 'bg-green-500' : 'bg-red-500'
                        : intensity > 0.6
                        ? profit ? 'bg-green-600' : 'bg-red-600'
                        : intensity > 0.4
                        ? profit ? 'bg-green-700' : 'bg-red-700'
                        : intensity > 0.2
                        ? profit ? 'bg-green-800' : 'bg-red-800'
                        : 'bg-gray-700'
                    }`}
                    title={`Week ${week + 1}, Day ${weekDay + 1}: ${profit ? '+' : '-'}$${(intensity * 500).toFixed(0)}`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
              <span>Less</span>
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-gray-700 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-800 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
              </div>
              <span>More</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
