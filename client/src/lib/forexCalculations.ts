// Forex Trading Calculations with Real-time Lot Sizing

export interface ForexPair {
  base: string;
  quote: string;
  pipValue: number; // Value per pip for 1 standard lot
  pipPosition: number; // Decimal position for pip calculation
}

export interface LotSizeConfig {
  type: 'standard' | 'mini' | 'micro' | 'nano';
  units: number;
  name: string;
}

// Common forex pairs with their pip values in USD
export const FOREX_PAIRS: Record<string, ForexPair> = {
  'EURUSD': { base: 'EUR', quote: 'USD', pipValue: 10, pipPosition: 4 },
  'GBPUSD': { base: 'GBP', quote: 'USD', pipValue: 10, pipPosition: 4 },
  'AUDUSD': { base: 'AUD', quote: 'USD', pipValue: 10, pipPosition: 4 },
  'NZDUSD': { base: 'NZD', quote: 'USD', pipValue: 10, pipPosition: 4 },
  'USDCAD': { base: 'USD', quote: 'CAD', pipValue: 9.35, pipPosition: 4 },
  'USDCHF': { base: 'USD', quote: 'CHF', pipValue: 10.87, pipPosition: 4 },
  'USDJPY': { base: 'USD', quote: 'JPY', pipValue: 9.12, pipPosition: 2 },
  'EURJPY': { base: 'EUR', quote: 'JPY', pipValue: 9.12, pipPosition: 2 },
  'GBPJPY': { base: 'GBP', quote: 'JPY', pipValue: 9.12, pipPosition: 2 },
  'AUDJPY': { base: 'AUD', quote: 'JPY', pipValue: 9.12, pipPosition: 2 },
  'EURGBP': { base: 'EUR', quote: 'GBP', pipValue: 12.84, pipPosition: 4 },
  'EURAUD': { base: 'EUR', quote: 'AUD', pipValue: 6.57, pipPosition: 4 },
  'GBPAUD': { base: 'GBP', quote: 'AUD', pipValue: 6.57, pipPosition: 4 },
  'AUDCAD': { base: 'AUD', quote: 'CAD', pipValue: 7.35, pipPosition: 4 },
  'NZDCAD': { base: 'NZD', quote: 'CAD', pipValue: 7.35, pipPosition: 4 },
  'EURCHF': { base: 'EUR', quote: 'CHF', pipValue: 10.87, pipPosition: 4 },
  'GBPCHF': { base: 'GBP', quote: 'CHF', pipValue: 10.87, pipPosition: 4 },
};

export const LOT_SIZES: Record<string, LotSizeConfig> = {
  'standard': { type: 'standard', units: 100000, name: 'Standard Lot (100k)' },
  'mini': { type: 'mini', units: 10000, name: 'Mini Lot (10k)' },
  'micro': { type: 'micro', units: 1000, name: 'Micro Lot (1k)' },
  'nano': { type: 'nano', units: 100, name: 'Nano Lot (100)' },
};

export interface ForexTradeCalculation {
  entryPrice: number;
  exitPrice: number;
  lotSize: number;
  lotType: string;
  symbol: string;
  type: 'Long' | 'Short';
}

export interface ForexTradeResult {
  pnl: number;
  pips: number;
  pipValue: number;
  positionSize: number; // Total units
  riskReward?: number;
  returnPercent: number;
}

/**
 * Calculate PnL for a forex trade with proper lot sizing
 */
export function calculateForexPnL(calculation: ForexTradeCalculation): ForexTradeResult {
  const pair = FOREX_PAIRS[calculation.symbol.toUpperCase()];
  
  if (!pair) {
    throw new Error(`Unsupported currency pair: ${calculation.symbol}`);
  }

  const lotConfig = LOT_SIZES[calculation.lotType] || LOT_SIZES.micro;
  const positionSize = calculation.lotSize * lotConfig.units;
  
  // Calculate pips based on the pair's pip position
  let pips: number;
  if (pair.pipPosition === 2) { // JPY pairs
    pips = (calculation.exitPrice - calculation.entryPrice) * 100;
  } else { // 4-decimal pairs
    pips = (calculation.exitPrice - calculation.entryPrice) * 10000;
  }

  // Adjust for Short positions
  if (calculation.type === 'Short') {
    pips = -pips;
  }

  // Calculate PnL
  const pipValueForPosition = (pair.pipValue / LOT_SIZES.standard.units) * positionSize;
  const pnl = pips * pipValueForPosition;

  // Calculate return percentage
  const notionalValue = positionSize * calculation.entryPrice;
  const returnPercent = (pnl / notionalValue) * 100;

  return {
    pnl: Math.round(pnl * 100) / 100, // Round to 2 decimal places
    pips: Math.round(pips * 10) / 10, // Round to 1 decimal place
    pipValue: pipValueForPosition,
    positionSize,
    returnPercent: Math.round(returnPercent * 100) / 100,
  };
}

/**
 * Calculate position size based on risk amount and stop loss
 */
export function calculatePositionSize(
  accountBalance: number,
  riskPercent: number,
  entryPrice: number,
  stopLoss: number,
  symbol: string
): { lotSize: number; lotType: string; positionSize: number } {
  const pair = FOREX_PAIRS[symbol.toUpperCase()];
  
  if (!pair) {
    throw new Error(`Unsupported currency pair: ${symbol}`);
  }

  const riskAmount = accountBalance * (riskPercent / 100);
  
  // Calculate stop loss in pips
  let stopLossPips: number;
  if (pair.pipPosition === 2) { // JPY pairs
    stopLossPips = Math.abs(entryPrice - stopLoss) * 100;
  } else { // 4-decimal pairs
    stopLossPips = Math.abs(entryPrice - stopLoss) * 10000;
  }

  // Calculate required position size
  const pipValuePerUnit = pair.pipValue / LOT_SIZES.standard.units;
  const requiredUnits = riskAmount / (stopLossPips * pipValuePerUnit);

  // Determine best lot type
  let lotType = 'nano';
  let lotSize = requiredUnits / LOT_SIZES.nano.units;

  if (requiredUnits >= LOT_SIZES.standard.units) {
    lotType = 'standard';
    lotSize = requiredUnits / LOT_SIZES.standard.units;
  } else if (requiredUnits >= LOT_SIZES.mini.units) {
    lotType = 'mini';
    lotSize = requiredUnits / LOT_SIZES.mini.units;
  } else if (requiredUnits >= LOT_SIZES.micro.units) {
    lotType = 'micro';
    lotSize = requiredUnits / LOT_SIZES.micro.units;
  }

  return {
    lotSize: Math.round(lotSize * 100) / 100,
    lotType,
    positionSize: requiredUnits,
  };
}

/**
 * Format currency amount with proper currency symbol
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
}

/**
 * Format pips display
 */
export function formatPips(pips: number): string {
  const sign = pips >= 0 ? '+' : '';
  return `${sign}${pips.toFixed(1)} pips`;
}

/**
 * Get supported currency pairs
 */
export function getSupportedPairs(): string[] {
  return Object.keys(FOREX_PAIRS);
}

/**
 * Check if a symbol is a supported forex pair
 */
export function isForexPair(symbol: string): boolean {
  return symbol.toUpperCase() in FOREX_PAIRS;
}
