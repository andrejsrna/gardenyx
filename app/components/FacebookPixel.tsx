'use client';

import Script from 'next/script';
// Removed useState as isLoaded is not currently used
// import { useEffect, useState } from 'react';
import { useCookieConsent } from '../context/CookieConsentContext';

declare global {
  interface Window {
    fbq: (action: string, event: string, params?: Record<string, unknown> | undefined) => void;
  }
}

export default function FacebookPixel() {
  const { consent, hasConsented } = useCookieConsent();
  // const [isLoaded, setIsLoaded] = useState(false); // Removed state

  if (!hasConsented || !consent.marketing) {
    return null;
  }

  return (
    <Script
      id="fb-pixel"
      strategy="afterInteractive"
      src="https://connect.facebook.net/en_US/fbevents.js"
      onLoad={() => {
        // Explicitly check and type window.fbq before calling
        const fbqFunc = window.fbq;
        if (typeof fbqFunc === 'function') {
          fbqFunc('init', process.env.NEXT_PUBLIC_FB_PIXEL_ID!);
          fbqFunc('track', 'PageView');
          // setIsLoaded(true); // Removed state update
        } else {
          console.error('Facebook Pixel function (fbq) not found after script load.');
        }
      }}
      onError={(e) => {
        console.error('Failed to load Facebook Pixel script:', e);
      }}
    />
  );
}

// Optional: Export a function to track custom events if needed, ensuring it checks for window.fbq
export const trackFbEvent = (eventName: string, params?: Record<string, unknown>) => {
  const fbqFunc = window.fbq;
  if (typeof fbqFunc === 'function') {
    fbqFunc('track', eventName, params);
  } else {
    console.warn('Cannot track FB event - fbq not available.');
  }
};
