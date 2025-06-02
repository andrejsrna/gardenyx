'use client';

import Script from 'next/script';
import { useCookieConsent } from '../context/CookieConsentContext';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

declare global {
  interface Window {
    google?: {
      maps?: {
        places?: {
          Autocomplete: new (input: HTMLInputElement, options?: object) => void;
        };
      };
    };
  }
}

export default function GoogleMaps() {
  const { consent, hasConsented } = useCookieConsent();

  if (!hasConsented || !consent.necessary) {
    return null;
  }

  if (!GOOGLE_MAPS_API_KEY) {
    console.error('Google Maps API key is not configured');
    return null;
  }

  return (
    <Script
      id="google-maps"
      strategy="afterInteractive"
      src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&language=sk&region=SK`}
      onLoad={() => {
        console.log('Google Maps API loaded successfully');
      }}
      onError={(e) => {
        console.error('Failed to load Google Maps API:', e);
      }}
    />
  );
} 