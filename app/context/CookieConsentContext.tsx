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
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent>({
    necessary: true,
    analytics: false,
    marketing: false,
  });
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <CookieConsentContext.Provider value={{ consent, setConsent, isModalOpen, setModalOpen }}>
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