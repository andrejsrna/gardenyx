'use client';

import { useEffect } from 'react';
import { testFacebookPixel } from '../components/FacebookPixel';
import { getCookieConsentValue, resetCookieConsentValue } from 'react-cookie-consent';
import { getCookieConsentDetails, hasConsentFor } from '../components/CookieConsentBanner';

export default function TestFacebookPixel() {
  useEffect(() => {
    console.log('Test: Component mounted');
    
    // Test after a delay to ensure everything is loaded
    setTimeout(() => {
      console.log('=== FACEBOOK PIXEL TEST WITH REACT-FACEBOOK-PIXEL ===');
      testFacebookPixel();
      
      // Additional tests
      console.log('Test: Environment variables:');
      console.log('NEXT_PUBLIC_FB_PIXEL_ID:', process.env.NEXT_PUBLIC_FB_PIXEL_ID);
      
      console.log('Test: Cookie consent check:');
      const cookieConsent = getCookieConsentValue('cookieConsent');
      const consentDetails = getCookieConsentDetails();
      const hasMarketingConsent = hasConsentFor('marketing');
      
      console.log('Cookie consent value:', cookieConsent);
      console.log('Consent details:', consentDetails);
      console.log('Marketing consent:', hasMarketingConsent);
      
      if (!cookieConsent) {
        console.log('No consent found - banner should be visible');
      }
      
      console.log('Test: Window object:');
      console.log('window.fbq:', typeof window.fbq);
      console.log('window._fbq:', window._fbq);
      
      // Test if we can call fbq
      if (typeof window.fbq === 'function') {
        console.log('Test: Calling fbq function...');
        try {
          window.fbq('track', 'test_event', { test: true });
          console.log('Test: fbq call successful');
        } catch (error) {
          console.error('Test: fbq call failed:', error);
        }
      } else {
        console.log('Test: fbq not available - check consent and initialization');
      }
    }, 3000);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Facebook Pixel Test</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Environment Variables:</h2>
          <p>FB Pixel ID: {process.env.NEXT_PUBLIC_FB_PIXEL_ID || 'Not set'}</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Open browser console (F12)</li>
            <li>Look for &quot;Test:&quot; messages</li>
            <li>Check if Facebook Pixel is loading</li>
            <li>Check if fbq function is available</li>
            <li>Check if test event is tracked</li>
          </ol>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Expected Results:</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>✅ Pixel ID should be configured</li>
            <li>✅ Cookie consent modal should appear on first visit</li>
            <li>✅ After accepting marketing cookies: window.fbq should be function</li>
            <li>✅ Facebook Pixel initialized successfully with react-facebook-pixel</li>
            <li>✅ Test events should track successfully</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Clear Storage (for testing):</h2>
          <div className="space-x-2">
            <button
              onClick={() => {
                resetCookieConsentValue('cookieConsent');
                localStorage.removeItem('cookieConsentDetails');
                console.log('Cookie consent cleared - reload page to see banner');
                alert('Cookie consent cleared - reload page to see banner');
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Clear Cookie Consent
            </button>
            <button
              onClick={() => {
                const consent = getCookieConsentValue('cookieConsent');
                const details = getCookieConsentDetails();
                console.log('Current consent:', consent);
                console.log('Current details:', details);
                alert(`Consent: ${consent}, Marketing: ${hasConsentFor('marketing')}`);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Check Consent Status
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            console.log('Manual test triggered');
            testFacebookPixel();
            
            if (typeof window.fbq === 'function') {
              window.fbq('track', 'manual_test', { manual: true });
              console.log('Manual fbq call successful');
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Run Manual Test
        </button>
      </div>
    </div>
  );
} 