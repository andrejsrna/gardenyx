'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  customerData: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    billing?: {
      first_name: string;
      last_name: string;
      company: string;
      address_1: string;
      address_2: string;
      city: string;
      state: string;
      postcode: string;
      country: string;
      email: string;
      phone: string;
    };
    shipping?: {
      first_name: string;
      last_name: string;
      company: string;
      address_1: string;
      address_2: string;
      city: string;
      state: string;
      postcode: string;
      country: string;
    };
    meta_data?: Array<{
      key: string;
      value: string;
    }>;
  } | null;
  login: (email: string, password: string) => Promise<AuthContextType['customerData']>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextType['customerData']>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('Checking auth...');
      const response = await fetch('/api/auth/check');
      if (!response.ok) {
        throw new Error('Auth check failed');
      }
      const data = await response.json();
      console.log('Auth check raw response:', data);
      
      if (data && data.customerData && data.customerData.id) {
        console.log('Setting user data:', data.customerData);
        setUser(data.customerData);
      } else {
        console.log('Invalid or missing user data:', data);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const userData = await response.json();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      setUser(null);
      
      // Clear all auth-related cookies
      document.cookie = 'customerId=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      document.cookie = 'customerToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      document.cookie = 'customerName=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      
      // Clear localStorage
      localStorage.removeItem('isAuthenticated');
      
      // Force a check of authentication state
      await checkAuth();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        customerData: user, 
        isAuthenticated: !!user,
        login, 
        logout, 
        isLoading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 