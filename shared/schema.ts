import { z } from "zod";

// Frontend-only types (no database dependencies)
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  preferredBroker: z.string().optional(),
  experience: z.string().optional(),
  bio: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const quickTradeSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  type: z.enum(["Long", "Short"]),
  entryPrice: z.string().min(1, "Entry price is required"),
  exitPrice: z.string().optional(),
  quantity: z.string().min(1, "Quantity is required"),
  lotType: z.enum(["standard", "mini", "micro", "nano"]).default("micro"),
  stopLoss: z.string().optional(),
  takeProfit: z.string().optional(),
  mood: z.number().min(1).max(5),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export const tradeSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  type: z.enum(["Long", "Short"]),
  entryPrice: z.number(),
  exitPrice: z.number().optional(),
  quantity: z.number(),
  lotType: z.enum(["standard", "mini", "micro", "nano"]).default("micro"),
  stopLoss: z.number().optional(),
  takeProfit: z.number().optional(),
  pnl: z.number().optional(),
  pips: z.number().optional(),
  returnPercent: z.number().optional(),
  riskReward: z.string().optional(),
  mood: z.number().min(1).max(5).optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  screenshots: z.array(z.string()).default([]),
  strategy: z.string().optional(),
  marketCondition: z.string().optional(),
  sessionType: z.string().optional(),
  entryTime: z.date(),
  exitTime: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  profilePicture: z.string().optional(),
  preferredBroker: z.string().optional(),
  experience: z.string().optional(),
  bio: z.string().optional(),
  defaultRisk: z.number().default(2.00),
  riskRewardRatio: z.string().default("1:2"),
  currency: z.string().default("USD"),
  emailNotifications: z.boolean().default(true),
  aiInsights: z.boolean().default(true),
  weeklyReports: z.boolean().default(false),
  pushNotifications: z.boolean().default(true),
  twoFactorEnabled: z.boolean().default(false),
  subscription: z.string().default("Free"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof userSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type Trade = z.infer<typeof tradeSchema>;
export type QuickTradeRequest = z.infer<typeof quickTradeSchema>;

// Additional types for API usage
export interface TradeFilters {
  period?: string;
  symbol?: string;
  type?: string;
  strategy?: string;
  status?: string;
  page?: number;
  limit?: number;
}
