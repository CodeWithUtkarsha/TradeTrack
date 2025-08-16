import type { Trade, TradeFilters } from "@shared/schema";

const API_BASE_URL = 'https://render-backend-tradejournal.onrender.com/api';

class TradeService {
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getAuthToken();
    
    console.log(`🌐 TradeService: Making request to ${url}`);
    console.log(`🔑 TradeService: Token exists: ${!!token}`);
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      console.log(`📊 TradeService: Response status: ${response.status}`);
      console.log(`📊 TradeService: Response data:`, data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`❌ TradeService: Request failed for ${url}:`, error);
      throw error;
    }
  }

  async getDashboardAnalytics(period: string = '30d') {
    // Pass period directly to backend - no mapping needed
    console.log(`📊 TradeService: getDashboardAnalytics called with period: ${period}`);
    return this.request(`/analytics/dashboard?period=${period}`);
  }

  async getTrades(filters: TradeFilters = {}) {
    console.log(`📊 TradeService: getTrades called with filters:`, filters);
    
    const params = new URLSearchParams();
    
    if (filters.period) params.append('period', filters.period);
    if (filters.symbol) params.append('symbol', filters.symbol);
    if (filters.type) params.append('type', filters.type);
    if (filters.strategy) params.append('strategy', filters.strategy);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/trades?${queryString}` : '/trades';
    
    console.log(`📊 TradeService: Final endpoint: ${endpoint}`);
    
    return this.request(endpoint);
  }

  async getTrade(id: string) {
    return this.request(`/trades/${id}`);
  }

  async createTrade(trade: Partial<Trade>) {
    return this.request('/trades', {
      method: 'POST',
      body: JSON.stringify(trade),
    });
  }

  async updateTrade(id: string, trade: Partial<Trade>) {
    return this.request(`/trades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(trade),
    });
  }

  async deleteTrade(id: string) {
    return this.request(`/trades/${id}`, {
      method: 'DELETE',
    });
  }

  async importTrades(file: File) {
    const formData = new FormData();
    formData.append('csvFile', file);
    
    return this.request('/trades/import', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  async exportTrades(format: string = 'csv') {
    return this.request(`/trades/export?format=${format}`);
  }

  async getPerformanceMetrics(period: string = '30d') {
    return this.request(`/analytics/performance?period=${period}`);
  }

  async getSymbolAnalytics(symbol: string) {
    return this.request(`/analytics/symbols/${symbol}`);
  }

  async uploadTradeScreenshot(file: File, tradeId?: string) {
    const formData = new FormData();
    formData.append('screenshot', file);
    if (tradeId) formData.append('tradeId', tradeId);
    
    return this.request('/upload/trade-screenshot', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }
}

// Create singleton instance
export const tradeService = new TradeService();
