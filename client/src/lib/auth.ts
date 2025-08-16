import type { LoginRequest, RegisterRequest, User } from "@shared/schema";

const API_BASE_URL = 'https://render-backend-tradejournal.onrender.com/api';

export interface AuthResponse {
  user: User;
  token: string;
}

export const auth = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('🔐 Auth: Attempting login for:', credentials.email);
      console.log('🔐 Auth: API URL:', `${API_BASE_URL}/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('🔐 Auth: Login response status:', response.status);
      const data = await response.json();
      console.log('🔐 Auth: Login response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user data
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user_data", JSON.stringify(data.user));
      
      console.log('✅ Auth: Login successful, token stored');
      
      // Dispatch custom event for auth state change
      window.dispatchEvent(new CustomEvent('auth-login', { 
        detail: { user: data.user, token: data.token } 
      }));

      return { user: data.user, token: data.token };
    } catch (error) {
      console.error('❌ Auth: Login error:', error);
      // Clear any existing auth data on failed login
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      throw error;
    }
  },

  async mockLogin(credentials: LoginRequest): Promise<AuthResponse> {
    // Mock user data
    const mockUser: User = {
      id: "mock-user-id",
      email: credentials.email,
      firstName: "Test",
      lastName: "User",
      profilePicture: "",
      preferredBroker: "MetaTrader",
      experience: "Intermediate (1-3 years)",
      bio: "Test trader",
      defaultRisk: 2.00,
      riskRewardRatio: "1:2",
      currency: "USD",
      emailNotifications: true,
      aiInsights: true,
      weeklyReports: false,
      pushNotifications: true,
      twoFactorEnabled: false,
      subscription: "Free",
      createdAt: new Date("2025-08-14"),
      updatedAt: new Date(),
    };

    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    if (credentials.email === "trader@example.com" && credentials.password === "TraderPassword123!") {
      const token = "mock-jwt-token";
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user_data", JSON.stringify(mockUser));
      
      // Dispatch custom event to notify components of login
      window.dispatchEvent(new CustomEvent('auth-login'));
      
      return {
        user: mockUser,
        token
      };
    } else {
      throw new Error("Invalid credentials");
    }
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      console.log('Attempting registration with data:', userData);
      console.log('API URL:', `${API_BASE_URL}/auth/register`);
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store token and user data
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user_data", JSON.stringify(data.user));
      
      // Dispatch custom event to notify components of login
      window.dispatchEvent(new CustomEvent('auth-login'));
      
      return {
        user: data.user,
        token: data.token
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  async mockRegister(userData: RegisterRequest): Promise<AuthResponse> {
    // Mock registration - in a real app, this would create a new user
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profilePicture: "",
      preferredBroker: "MetaTrader",
      experience: "Beginner",
      bio: "",
      defaultRisk: 2.00,
      riskRewardRatio: "1:2",
      currency: "USD",
      emailNotifications: true,
      aiInsights: true,
      weeklyReports: false,
      pushNotifications: true,
      twoFactorEnabled: false,
      subscription: "Free",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const token = "mock-jwt-token";
    localStorage.setItem("auth_token", token);
    localStorage.setItem("user_data", JSON.stringify(newUser));
    
    // Dispatch custom event to notify components of registration/login
    window.dispatchEvent(new CustomEvent('auth-login'));
    
    return {
      user: newUser,
      token
    };
  },

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem("auth_token");
    console.log('🔍 Auth: getCurrentUser - token exists:', !!token);
    
    if (!token) return null;

    try {
      // Try to get user from backend API first
      console.log('🔍 Auth: Checking if token is mock:', token === "mock-jwt-token");
      if (token !== "mock-jwt-token") {
        console.log('🔍 Auth: Making request to /auth/me');
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log('🔍 Auth: /auth/me response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Auth: Got user from API:', data.user);
          
          // Merge with localStorage data to get profile picture and other local updates
          const userData = localStorage.getItem("user_data");
          if (userData) {
            try {
              const localUser = JSON.parse(userData) as User;
              // Merge API data with localStorage data, prioritizing localStorage for profile picture
              const mergedUser = { 
                ...data.user, 
                profilePicture: localUser.profilePicture || data.user.profilePicture 
              };
              console.log('🔄 Auth: Merged user data with localStorage profile picture');
              return mergedUser;
            } catch (error) {
              console.log('⚠️ Auth: Failed to parse localStorage data, using API data only');
            }
          }
          
          return data.user;
        } else {
          console.log('❌ Auth: /auth/me failed, response:', await response.text());
        }
      }

      // Fallback to localStorage data
      console.log('🔍 Auth: Falling back to localStorage data');
      const userData = localStorage.getItem("user_data");
      if (userData) {
        const user = JSON.parse(userData) as User;
        console.log('✅ Auth: Got user from localStorage:', user);
        return user;
      }
      console.log('❌ Auth: No user data found');
      return null;
    } catch (error) {
      console.error('❌ Auth: getCurrentUser error:', error);
      
      // Try fallback to localStorage
      try {
        const userData = localStorage.getItem("user_data");
        if (userData) {
          return JSON.parse(userData) as User;
        }
      } catch (parseError) {
        console.error('Failed to parse user data:', parseError);
      }
      
      this.logout();
      return null;
    }
  },

  logout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    // Dispatch custom event to notify components of logout
    window.dispatchEvent(new CustomEvent('auth-logout'));
  },

  async uploadProfilePicture(profilePictureData: string): Promise<User> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('🖼️ Auth: Uploading profile picture to backend');
      
      const response = await fetch(`${API_BASE_URL}/auth/profile-picture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ profilePicture: profilePictureData }),
      });

      console.log('🖼️ Auth: Profile picture upload response status:', response.status);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload profile picture');
      }

      // Update localStorage with new user data
      localStorage.setItem("user_data", JSON.stringify(data.user));
      console.log('✅ Auth: Profile picture uploaded successfully');
      
      return data.user;
    } catch (error) {
      console.error('❌ Auth: Profile picture upload error:', error);
      throw error;
    }
  },

  async deleteProfilePicture(): Promise<User> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('🗑️ Auth: Deleting profile picture from backend');
      
      const response = await fetch(`${API_BASE_URL}/auth/profile-picture`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      console.log('🗑️ Auth: Profile picture delete response status:', response.status);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete profile picture');
      }

      // Update localStorage with new user data
      localStorage.setItem("user_data", JSON.stringify(data.user));
      console.log('✅ Auth: Profile picture deleted successfully');
      
      return data.user;
    } catch (error) {
      console.error('❌ Auth: Profile picture delete error:', error);
      throw error;
    }
  },

  getToken(): string | null {
    return localStorage.getItem("auth_token");
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};
