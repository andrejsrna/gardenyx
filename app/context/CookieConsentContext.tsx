'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface CookieConsentContextType {
  consent: CookieConsent;
  setConsent: (consent: CookieConsent) => void;
  isModalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  hasConsented: boolean;
  openCookieManager: () => void;
}

const defaultConsent: CookieConsent = {
  necessary: true,
  analytics: true,
  marketing: true,
};

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent>(defaultConsent);
  const [isModalOpen, setModalOpen] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    // Check localStorage first
    const savedConsent = localStorage.getItem('cookieConsent');
    
    // Check cookies as fallback
    const getCookie = (name: string) => {
      if (typeof document === 'undefined') return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };
    
    const cookieConsent = getCookie('cookieConsent');
    
    if (savedConsent || cookieConsent) {
      try {
        const consentData = savedConsent ? JSON.parse(savedConsent) : JSON.parse(cookieConsent!);
        setConsent(consentData);
        setHasConsented(true);
      } catch (error) {
        console.error('Error parsing cookie consent:', error);
        localStorage.removeItem('cookieConsent');
        if (typeof document !== 'undefined') {
          document.cookie = 'cookieConsent=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        setConsent(defaultConsent);
        setModalOpen(true);
        setHasConsented(false);
      }
    } else {
      setModalOpen(true);
      setConsent(defaultConsent);
      setHasConsented(false);
    }
  }, []);

  const handleSetConsent = (newConsent: CookieConsent) => {
    setConsent(newConsent);
    setHasConsented(true);
    setModalOpen(false);
    
    // Save to localStorage
    localStorage.setItem('cookieConsent', JSON.stringify(newConsent));
    
    // Save to cookies
    try {
      const consentString = JSON.stringify(newConsent);
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);
      const secureFlag = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `cookieConsent=${consentString}; path=/; expires=${expires.toUTCString()}; SameSite=Lax${secureFlag}`;
    } catch (error) {
      console.error('Failed to set cookie:', error);
    }
  };

  const openCookieManager = () => {
    setModalOpen(true);
  };

  return (
    <CookieConsentContext.Provider 
      value={{ 
        consent, 
        setConsent: handleSetConsent, 
        isModalOpen, 
        setModalOpen,
        hasConsented,
        openCookieManager 
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
}