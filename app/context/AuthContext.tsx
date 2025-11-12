'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { toast } from 'sonner';
import { getSession } from '../lib/utils/session';

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

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextType['customerData']>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPersistedIdentity, setHasPersistedIdentity] = useState(false);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await fetch('/api/auth/logout', { method: 'POST' });
      
      // Clear session
      const session = await getSession();
      session.destroy();
      
      setUser(null);
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
    if (typeof window === 'undefined') {
      return;
    }

    if (user) {
      const billing = user.billing;
      const billingRecord = billing as Partial<Record<string, string | undefined>> | undefined;
      const userRecord = user as unknown as Partial<Record<string, string | undefined>>;
      const normalizedIdentity = {
        email: billing?.email || user.email || '',
        phone: billing?.phone || '',
        firstName: billing?.first_name || billingRecord?.firstName || user.first_name || userRecord?.firstName || '',
        lastName: billing?.last_name || billingRecord?.lastName || user.last_name || userRecord?.lastName || '',
        city: billing?.city || '',
        state: billing?.state || '',
        zip: billing?.postcode || '',
        country: billing?.country || '',
      };

      try {
        window.localStorage.setItem('customerIdentity', JSON.stringify(normalizedIdentity));
        setHasPersistedIdentity(true);
      } catch (error) {
        console.warn('[AuthProvider] Failed to persist customer identity', error);
      }
    } else if (hasPersistedIdentity) {
      try {
        window.localStorage.removeItem('customerIdentity');
      } catch (error) {
        console.warn('[AuthProvider] Failed to clear customer identity', error);
      } finally {
        setHasPersistedIdentity(false);
      }
    }
  }, [user, hasPersistedIdentity]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (user) {
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
  }, [user, logout]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check');
      if (!response.ok) {
        throw new Error('Auth check failed');
      }
      const data = await response.json();
      
      if (data && data.customerData && data.customerData.id) {
        setUser(data.customerData);
      } else {
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
      
      // Update session
      const session = await getSession();
      session.customerId = userData.id;
      session.isLoggedIn = true;
      await session.save();

      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
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
