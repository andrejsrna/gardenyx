'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getCookieConsentValue } from 'react-cookie-consent';
import { getCookieConsentDetails, hasConsentFor } from '../components/CookieConsentBanner';

interface CookieConsentContextType {
  consent: string | null;
  hasConsented: boolean;
  consentDetails: {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    timestamp: string;
  } | null;
  hasConsentFor: (type: 'necessary' | 'analytics' | 'marketing') => boolean;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<string | null>(null);
  const [consentDetails, setConsentDetails] = useState<CookieConsentContextType['consentDetails']>(null);

  useEffect(() => {
    const cookieConsent = getCookieConsentValue('cookieConsent') || null;
    const details = getCookieConsentDetails();
    
    setConsent(cookieConsent);
    setConsentDetails(details);

    const checkConsent = () => {
      const currentConsent = getCookieConsentValue('cookieConsent') || null;
      const currentDetails = getCookieConsentDetails();
      
      setConsent(currentConsent);
      setConsentDetails(currentDetails);
    };

    window.addEventListener('storage', checkConsent);
    return () => window.removeEventListener('storage', checkConsent);
  }, []);

  const hasConsented = consent === 'true';
  const hasConsentForType = (type: 'necessary' | 'analytics' | 'marketing') => hasConsentFor(type);

  const value: CookieConsentContextType = {
    consent,
    hasConsented,
    consentDetails,
    hasConsentFor: hasConsentForType,
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