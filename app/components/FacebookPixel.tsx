'use client';

import { useEffect, useState } from 'react';
import { getCookieConsentValue } from 'react-cookie-consent';
import { hasConsentFor } from './CookieConsentBanner';

export default function FacebookPixel() {
  const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !pixelId) {
      if (!pixelId) {
        console.error('Facebook Pixel ID is not defined in environment variables');
      }
      return;
    }

    // Check if user has consented to cookies
    const cookieConsent = getCookieConsentValue('cookieConsent');
    const hasMarketingConsent = hasConsentFor('marketing');

    if (!cookieConsent || cookieConsent === 'false' || !hasMarketingConsent) {
      console.log('Facebook Pixel not initialized - no marketing consent');
      return;
    }

    // Dynamic import to avoid SSR issues
    import('react-facebook-pixel').then((ReactPixel) => {
      try {
        const options = {
          autoConfig: true,
          debug: process.env.NODE_ENV === 'development',
        };

        ReactPixel.default.init(pixelId, undefined, options);
        ReactPixel.default.pageView();
        
        console.log('Facebook Pixel initialized successfully with react-facebook-pixel');
      } catch (error) {
        console.error('Error initializing Facebook Pixel:', error);
      }
    });
  }, [pixelId, isClient]);

  if (!pixelId) {
    return null;
  }

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: 'none' }}
        src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
}

// Export a function to track custom events using react-facebook-pixel
export const trackFbEvent = async (eventName: string, params?: Record<string, unknown>) => {
  if (typeof window === 'undefined') return;

  const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
  if (!pixelId) {
    console.warn('Cannot track FB event - Pixel ID not configured');
    return;
  }

  // Check marketing consent
  const cookieConsent = getCookieConsentValue('cookieConsent');
  const hasMarketingConsent = hasConsentFor('marketing');

  if (!cookieConsent || cookieConsent === 'false' || !hasMarketingConsent) {
    console.warn('Cannot track FB event - no marketing consent');
    return;
  }

  try {
    const ReactPixel = await import('react-facebook-pixel');
    ReactPixel.default.track(eventName, params);
    console.log('Facebook Pixel event tracked:', eventName, params);
  } catch (error) {
    console.error('Error tracking Facebook Pixel event:', error);
  }
};

// Test function to check Facebook Pixel status with react-facebook-pixel
export const testFacebookPixel = async () => {
  if (typeof window === 'undefined') {
    console.log('Test: Window not available (SSR)');
    return;
  }

  const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
  console.log('Test: Pixel ID:', pixelId);

  const cookieConsent = getCookieConsentValue('cookieConsent');
  console.log('Test: Cookie consent value:', cookieConsent);
  
  const hasMarketingConsent = hasConsentFor('marketing');
  console.log('Test: Marketing consent:', hasMarketingConsent);

  const storedConsentDetails = localStorage.getItem('cookieConsentDetails');
  console.log('Test: Stored consent details:', storedConsentDetails);

  console.log('Test: Should pixel initialize?', cookieConsent === 'true' && hasMarketingConsent);

  console.log('Test: Window.fbq type:', typeof window.fbq);
  console.log('Test: Window.fbq function:', window.fbq);
  
  try {
    const ReactPixel = await import('react-facebook-pixel');
    console.log('Test: ReactPixel methods available:', Object.keys(ReactPixel.default));
  } catch (error) {
    console.log('Test: Error importing ReactPixel:', error);
  }
  
  // Test tracking function
  console.log('Test: Testing trackFbEvent function...');
  await trackFbEvent('test_event', { test: true });
};
