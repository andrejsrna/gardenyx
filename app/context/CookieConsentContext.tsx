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
  analytics: false,
  marketing: false,
};

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent>(defaultConsent);
  const [isModalOpen, setModalOpen] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    // Check for existing consent in localStorage
    const savedConsent = localStorage.getItem('cookieConsent');
    if (savedConsent) {
      try {
        const parsedConsent = JSON.parse(savedConsent);
        setConsent(parsedConsent);
        setHasConsented(true);
      } catch (error) {
        console.error('Error parsing cookie consent:', error);
        localStorage.removeItem('cookieConsent');
      }
    } else {
      setModalOpen(true);
    }
  }, []);

  const handleSetConsent = (newConsent: CookieConsent) => {
    setConsent(newConsent);
    setHasConsented(true);
    localStorage.setItem('cookieConsent', JSON.stringify(newConsent));
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