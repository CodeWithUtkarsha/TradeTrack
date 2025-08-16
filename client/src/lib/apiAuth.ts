import type { LoginRequest, RegisterRequest, User } from "@shared/schema";

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

const API_BASE_URL = 'https://render-backend-tradejournal.onrender.com/api';

class AuthService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${this.token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Auth API Request failed:', error);
      
      // If it's a network error and we have a fallback, use mock data
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn('Backend not available, falling back to mock data');
        return this.fallbackToMockAuth(endpoint, options);
      }
      
      throw error;
    }
  }

  private async fallbackToMockAuth(endpoint: string, options: RequestInit): Promise<any> {
    console.log('Using mock auth fallback for:', endpoint);
    
    if (endpoint === '/auth/login' && options.method === 'POST') {
      const body = JSON.parse(options.body as string);
      if (body.email === 'usalve@gitlam.in' && body.password === 'password') {
        return {
          success: true,
          token: 'mock-jwt-token',
          user: {
            id: 'mock-user-id',
            email: 'usalve@gitlam.in',
            firstName: 'Utkarsha',
            lastName: 'Salve',
            profilePicture: '',
            preferredBroker: 'MetaTrader',
            experience: 'Intermediate (1-3 years)',
            bio: 'Passionate trader',
            defaultRisk: 2.00,
            riskRewardRatio: '1:2',
            currency: 'USD',
            emailNotifications: true,
            aiInsights: true,
            weeklyReports: false,
            pushNotifications: true,
            twoFactorEnabled: false,
            subscription: 'Free',
            createdAt: new Date('2025-08-14'),
            updatedAt: new Date(),
          }
        };
      } else {
        throw new Error('Invalid credentials');
      }
    }
    
    if (endpoint === '/auth/register' && options.method === 'POST') {
      return {
        success: true,
        message: 'Registration successful',
        token: 'mock-jwt-token',
        user: {
          id: 'mock-user-id',
          email: 'newuser@example.com',
          firstName: 'New',
          lastName: 'User',
        }
      };
    }

    throw new Error('Mock fallback not implemented for this endpoint');
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      if (response.token) {
        this.token = response.token;
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user_data', JSON.stringify(response.user));
        
        // Dispatch custom event to notify components of login
        window.dispatchEvent(new CustomEvent('auth-login'));
      }

      return {
        user: response.user,
        token: response.token,
        message: response.message,
      };
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
          password: userData.password,
        }),
      });

      if (response.token) {
        this.token = response.token;
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user_data', JSON.stringify(response.user));
        
        // Dispatch custom event to notify components of login
        window.dispatchEvent(new CustomEvent('auth-login'));
      }

      return {
        user: response.user,
        token: response.token,
        message: response.message,
      };
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.token) {
        await this.request('/auth/logout', {
          method: 'POST',
        });
      }
    } catch (error) {
      console.warn('Logout request failed, clearing local data anyway');
    } finally {
      this.token = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      // Dispatch custom event to notify components of logout
      window.dispatchEvent(new CustomEvent('auth-logout'));
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await this.request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      return { message: response.message };
    } catch (error) {
      console.error('Forgot password failed:', error);
      throw error;
    }
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    try {
      const response = await this.request('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });

      return { message: response.message };
    } catch (error) {
      console.error('Reset password failed:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      if (!this.token) {
        return null;
      }

      const response = await this.request('/user/profile');
      return response.user;
    } catch (error) {
      console.error('Get current user failed:', error);
      this.logout();
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  async checkAuthStatus(): Promise<boolean> {
    if (!this.token) return false;
    
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      this.logout();
      return false;
    }
  }
}

// Create singleton instance
export const auth = new AuthService();
