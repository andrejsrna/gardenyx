'use client';

import { useCookieConsent } from '../context/CookieConsentContext';
import { tracking } from '../lib/tracking';

interface LeadTrackingProps {
  formName: string;
  value?: number;
  children: React.ReactNode;
  className?: string;
}

export default function LeadTracking({ formName, value, children, className }: LeadTrackingProps) {
  const { consent, hasConsented } = useCookieConsent();

  const handleLeadGeneration = () => {
    if (hasConsented && consent.analytics) {
      tracking.lead(formName, value);
    }
  };

  return (
    <div onClick={handleLeadGeneration} className={className}>
      {children}
    </div>
  );
} 