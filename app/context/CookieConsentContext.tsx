'use client';

import { createContext, useContext, useState } from 'react';

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
  const [hasConsented, setHasConsented] = useState(true); // Always true

  const handleSetConsent = (newConsent: CookieConsent) => {
    setConsent(newConsent);
    setHasConsented(true);
    setModalOpen(false);
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