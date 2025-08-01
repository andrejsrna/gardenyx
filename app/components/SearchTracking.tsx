'use client';

import { useCookieConsent } from '../context/CookieConsentContext';
import { tracking } from '../lib/tracking';
import { useEffect } from 'react';

interface SearchTrackingProps {
  searchTerm: string;
  resultsCount?: number;
}

export default function SearchTracking({ searchTerm, resultsCount }: SearchTrackingProps) {
  const { consent, hasConsented } = useCookieConsent();

  useEffect(() => {
    // Check both analytics (for GA) and marketing (for FB Pixel) consent
    if (hasConsented && (consent.analytics || consent.marketing)) {
      tracking.search(searchTerm, resultsCount);
    }
  }, [searchTerm, resultsCount, hasConsented, consent.analytics, consent.marketing]);

  return (
    <button
      onClick={() => {}} // No-op to prevent button from being clickable
      className="hidden"
      aria-hidden="true"
    >
      Track Search
    </button>
  );
} 