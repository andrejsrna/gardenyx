'use client';

import { useCookieConsent } from '../context/CookieConsentContext';
import { tracking } from '../lib/tracking';
import { useEffect } from 'react';

interface LeadTrackingProps {
  formName: string;
  value?: number;
  children: React.ReactNode;
  className?: string;
}

export default function LeadTracking({ formName, value, children, className }: LeadTrackingProps) {
  const { consent, hasConsented } = useCookieConsent();

  useEffect(() => {
    // Check both analytics (for GA) and marketing (for FB Pixel) consent
    if (hasConsented && (consent.analytics || consent.marketing)) {
      tracking.lead(formName, value);
    }
  }, [formName, value, hasConsented, consent.analytics, consent.marketing]);

  return (
    <div onClick={() => {
      if (hasConsented && (consent.analytics || consent.marketing)) {
        tracking.lead(formName, value);
      }
    }} className={className}>
      {children}
    </div>
  );
} 