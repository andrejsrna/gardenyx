'use client';

import { useCookieConsent } from '../context/CookieConsentContext';
import { tracking } from '../lib/tracking';

interface SearchTrackingProps {
  searchTerm: string;
  resultsCount?: number;
}

export default function SearchTracking({ searchTerm, resultsCount }: SearchTrackingProps) {
  const { consent, hasConsented } = useCookieConsent();

  const handleSearch = () => {
    if (hasConsented && consent.analytics) {
      tracking.search(searchTerm, resultsCount);
    }
  };

  return (
    <button
      onClick={handleSearch}
      className="hidden"
      aria-hidden="true"
    >
      Track Search
    </button>
  );
} 