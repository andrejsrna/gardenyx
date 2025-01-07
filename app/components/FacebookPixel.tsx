'use client';

import { init, track } from 'fbq';
import { useEffect } from 'react';
import { useCookieConsent } from '../context/CookieConsentContext';

export default function FacebookPixel() {
  const { consent, hasConsented } = useCookieConsent();

  useEffect(() => {
    if (hasConsented && consent.marketing) {
      // Initialize Facebook Pixel
      init(process.env.NEXT_PUBLIC_FB_PIXEL_ID!);
      track('PageView');

      // Load Facebook Pixel script
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(script);
    }
  }, [consent.marketing, hasConsented]);

  return null;
}

// Export a compatible fbq function
export const fbq = (
  action: string,
  event: string,
  params?: Record<string, unknown>
) => {
  if (action === 'track') {
    track(event, params);
  } else if (action === 'init') {
    init(event);
  }
};