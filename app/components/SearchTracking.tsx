'use client';

import { useEffect } from 'react';
import { tracking } from '../lib/tracking';

interface SearchTrackingProps {
  searchTerm: string;
  resultsCount: number;
}

export default function SearchTracking({ searchTerm, resultsCount }: SearchTrackingProps) {
  useEffect(() => {
    tracking.search(searchTerm, resultsCount);
  }, [searchTerm, resultsCount]);

  return (
    <button
      onClick={() => {}} // No-op to prevent button from being clickable
      className="hidden"
      aria-hidden="true"
    />
  );
} 