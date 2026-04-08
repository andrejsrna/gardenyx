'use client';

import { createContext, useContext, useSyncExternalStore } from 'react';
import {
  getCookieConsentSnapshot,
  hasConsentFor,
  subscribeToCookieConsentChanges,
} from '../components/CookieConsentBanner';

interface CookieConsentContextType {
  consent: string | null;
  hasConsented: boolean;
  consentDetails: {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    timestamp?: string;
  } | null;
  hasConsentFor: (type: 'necessary' | 'analytics' | 'marketing') => boolean;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const { consent, details: consentDetails } = useSyncExternalStore(
    subscribeToCookieConsentChanges,
    getCookieConsentSnapshot,
    getCookieConsentSnapshot,
  );

  const value: CookieConsentContextType = {
    consent,
    hasConsented: consent === 'true',
    consentDetails,
    hasConsentFor: (type) => hasConsentFor(type),
  };

  return (
    <CookieConsentContext.Provider value={value}>
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
