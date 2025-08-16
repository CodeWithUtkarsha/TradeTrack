import { QueryClient } from "@tanstack/react-query";
import type { Trade } from "@shared/schema";

// Mock trade data for the frontend-only app
const mockTrades: Trade[] = [
  {
    id: "trade-1",
    symbol: "EURUSD",
    type: "Long",
    entryPrice: 1.0850,
    exitPrice: 1.0920,
    quantity: 10000,
    pnl: 70,
    returnPercent: 0.65,
    riskReward: "1:2",
    mood: 4,
    tags: ["scalping", "news"],
    notes: "Good ECB news drove the move",
    screenshots: [],
    strategy: "News Trading",
    marketCondition: "Trending",
    sessionType: "London",
    entryTime: new Date("2025-01-10T08:30:00Z"),
    exitTime: new Date("2025-01-10T09:15:00Z"),
    createdAt: new Date("2025-01-10T08:30:00Z"),
    updatedAt: new Date("2025-01-10T09:15:00Z"),
  },
  {
    id: "trade-2",
    symbol: "GBPJPY",
    type: "Short",
    entryPrice: 195.50,
    exitPrice: 194.80,
    quantity: 5000,
    pnl: 35,
    returnPercent: 0.36,
    riskReward: "1:1.5",
    mood: 3,
    tags: ["reversal"],
    notes: "Resistance level held",
    screenshots: [],
    strategy: "Support/Resistance",
    marketCondition: "Ranging",
    sessionType: "London",
    entryTime: new Date("2025-01-09T14:20:00Z"),
    exitTime: new Date("2025-01-09T15:45:00Z"),
    createdAt: new Date("2025-01-09T14:20:00Z"),
    updatedAt: new Date("2025-01-09T15:45:00Z"),
  },
];

// Mock API functions for frontend-only app
export const mockApi = {
  async getTrades(): Promise<Trade[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const stored = localStorage.getItem("trades");
    return stored ? JSON.parse(stored) : mockTrades;
  },

  async addTrade(trade: Omit<Trade, "id" | "createdAt" | "updatedAt">): Promise<Trade> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newTrade: Trade = {
      ...trade,
      id: `trade-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const trades = await this.getTrades();
    const updatedTrades = [...trades, newTrade];
    localStorage.setItem("trades", JSON.stringify(updatedTrades));
    
    return newTrade;
  },

  async updateTrade(id: string, updates: Partial<Trade>): Promise<Trade> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const trades = await this.getTrades();
    const index = trades.findIndex(t => t.id === id);
    
    if (index === -1) {
      throw new Error("Trade not found");
    }

    const updatedTrade = {
      ...trades[index],
      ...updates,
      updatedAt: new Date(),
    };

    trades[index] = updatedTrade;
    localStorage.setItem("trades", JSON.stringify(trades));
    
    return updatedTrade;
  },

  async deleteTrade(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const trades = await this.getTrades();
    const filteredTrades = trades.filter(t => t.id !== id);
    localStorage.setItem("trades", JSON.stringify(filteredTrades));
  }
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 1 * 60 * 1000, // 1 minute for most queries
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
