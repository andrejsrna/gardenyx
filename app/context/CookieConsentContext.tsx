'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface CookieConsent {
  analytics: boolean;
  marketing: boolean;
  necessary: boolean;
}

interface CookieConsentContextType {
  consent: CookieConsent;
  isModalOpen: boolean;
  setConsent: (consent: CookieConsent) => void;
  setModalOpen: (open: boolean) => void;
  hasUserConsented: boolean;
  openCookieManager: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

const defaultConsent: CookieConsent = {
  analytics: false,
  marketing: false,
  necessary: true, // Always true as these are essential
};

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent>(defaultConsent);
  const [isModalOpen, setModalOpen] = useState(true);
  const [hasUserConsented, setHasUserConsented] = useState(false);

  useEffect(() => {
    // Check for existing consent in localStorage
    try {
      const savedConsent = localStorage.getItem('cookieConsent');
      if (savedConsent) {
        const parsedConsent = JSON.parse(savedConsent);
        // Validate the parsed consent object
        if (
          typeof parsedConsent === 'object' &&
          'analytics' in parsedConsent &&
          'marketing' in parsedConsent &&
          'necessary' in parsedConsent
        ) {
          setConsent(parsedConsent);
          setHasUserConsented(true);
          setModalOpen(false);
        } else {
          // Invalid consent object, clear it
          localStorage.removeItem('cookieConsent');
        }
      }
    } catch (error) {
      // If there's an error parsing the JSON, clear the invalid data
      console.error('Error parsing cookie consent:', error);
      localStorage.removeItem('cookieConsent');
    }
  }, []);

  const updateConsent = (newConsent: CookieConsent) => {
    try {
      setConsent(newConsent);
      localStorage.setItem('cookieConsent', JSON.stringify(newConsent));
      setHasUserConsented(true);
    } catch (error) {
      console.error('Error saving cookie consent:', error);
    }
  };

  const openCookieManager = () => {
    setModalOpen(true);
  };

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        isModalOpen,
        setConsent: updateConsent,
        setModalOpen,
        hasUserConsented,
        openCookieManager,
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