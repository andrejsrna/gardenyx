'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getSession } from '../lib/utils/session';

// Export the customer data type
export interface CustomerDataType {
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
}

interface AuthContextType {
  isAuthenticated: boolean;
  customerData: CustomerDataType | null;
  login: (email: string, password: string) => Promise<CustomerDataType | null>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerDataType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await fetch('/api/auth/logout', { method: 'POST' });

      // Clear session
      const session = await getSession();
      session.destroy();

      setCustomerData(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (customerData) {
        timeoutId = setTimeout(() => {
          logout();
          toast.info('Sedenie vypršalo', {
            description: 'Z bezpečnostných dôvodov ste boli odhlásený.'
          });
        }, SESSION_TIMEOUT);
      }
    };

    resetTimeout();
    window.addEventListener('mousemove', resetTimeout);
    window.addEventListener('keypress', resetTimeout);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimeout);
      window.removeEventListener('keypress', resetTimeout);
    };
  }, [customerData, logout]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check'); // Revert to fetching endpoint
      if (!response.ok) {
        throw new Error('Auth check failed');
      }
      const data = await response.json(); // Use the data from the endpoint

      if (data && data.customerData && data.customerData.id) {
        setCustomerData(data.customerData);
        setIsAuthenticated(true);
      } else {
        setCustomerData(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setCustomerData(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (email: string, password: string): Promise<CustomerDataType | null> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      // Fetch full customer data after successful login
      const session = await getSession();
      if (session && session.customerId) {
        const customerRes = await fetch('/api/woocommerce/customer', {
          headers: {
             // Assuming session contains necessary auth info for the API route
             'Authorization': `Bearer ${session.customerId}` // Example, adjust as needed
          }
        });
        if (customerRes.ok) {
            const fullCustomerData: CustomerDataType = await customerRes.json();
            setCustomerData(fullCustomerData);
            setIsAuthenticated(true);
            toast.success('Prihlásenie úspešné');
            return fullCustomerData;
        } else {
            throw new Error('Failed to fetch customer data after login');
        }
      } else {
          throw new Error('Session data not available after login');
      }

    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Nastala chyba pri prihlásení');
      setCustomerData(null);
      setIsAuthenticated(false);
      return null; // Return null on failure
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        customerData,
        isAuthenticated,
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
