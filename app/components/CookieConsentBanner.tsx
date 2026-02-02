'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CookieConsent, { getCookieConsentValue } from 'react-cookie-consent';
import { safeGetItem } from '../lib/utils/safe-local-storage';

type ConsentDetails = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

const storeConsentDetails = (details: ConsentDetails) => {
  try {
    localStorage.setItem('cookieConsentDetails', JSON.stringify(details));
  } catch {
    // ignore storage errors
  }
};

const ACCEPTED_DETAILS: ConsentDetails = {
  necessary: true,
  analytics: true,
  marketing: true,
};

const DECLINED_DETAILS: ConsentDetails = {
  necessary: true,
  analytics: false,
  marketing: false,
};

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  // Temporary guard for Seznam browser (Android) crash: "Cannot read properties of null (reading 'touches')"
  // Likely caused by a third-party listener inside react-cookie-consent or the browser itself.
  // Skip rendering the banner on Seznam to avoid the crash; this defaults to no optional cookies loaded.
  const isSeznamBrowser = typeof navigator !== 'undefined' && /SeznamBrowser|Seznam|Szn/i.test(navigator.userAgent || '');

  useEffect(() => {
    if (isSeznamBrowser) {
      // Debug log; remove after verifying fix
      console.warn('[CookieConsentBanner] Skipping banner on Seznam browser to avoid touch event crash');
      setIsVisible(false);
      return;
    }
    const existingConsent = getCookieConsentValue('cookieConsent');
    
    if (!existingConsent) {
      setIsVisible(true);
    } else if (typeof window !== 'undefined' && !safeGetItem('cookieConsentDetails')) {
      storeConsentDetails(existingConsent === 'true' ? ACCEPTED_DETAILS : DECLINED_DETAILS);
    }
  }, [isSeznamBrowser]);

  const handleAcceptAll = () => {
    setIsVisible(false);
    storeConsentDetails(ACCEPTED_DETAILS);
    window.location.reload();
  };

  const handleDeclineAll = () => {
    setIsVisible(false);
    storeConsentDetails(DECLINED_DETAILS);
  };

  if (!isSeznamBrowser && isVisible) {
    return (
      <CookieConsent
        location="bottom"
        buttonText="Prijať všetko"
        declineButtonText="Odmietnuť všetko"
        cookieName="cookieConsent"
        cookieValue="true"
        declineCookieValue="false"
        enableDeclineButton={true}
        flipButtons={true}
        expires={365}
        onAccept={handleAcceptAll}
        onDecline={handleDeclineAll}
        style={{
          background: "#2d3748",
          color: "#fff",
          fontSize: "14px",
          padding: "20px",
        }}
        buttonStyle={{
          backgroundColor: "#10b981",
          color: "#fff",
          fontSize: "14px",
          borderRadius: "6px",
          padding: "10px 20px",
          border: "none",
          cursor: "pointer",
        }}
        declineButtonStyle={{
          backgroundColor: "#6b7280",
          color: "#fff",
          fontSize: "14px",
          borderRadius: "6px",
          padding: "10px 20px",
          border: "none",
          cursor: "pointer",
          marginRight: "10px",
        }}
        buttonClasses="hover:bg-green-600 transition-colors duration-200"
        declineButtonClasses="hover:bg-gray-600 transition-colors duration-200"
        ariaAcceptLabel="Prijať všetky cookies"
        ariaDeclineLabel="Odmietnuť voliteľné cookies"
      >
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Nastavenia cookies</h3>
          <p className="text-sm leading-relaxed">
            Používame cookies na zlepšenie vášho zážitku z nakupovania a na analýzu návštevnosti.
            Niektoré sú nevyhnutné pre fungovanie stránky, zatiaľ čo iné nám pomáhajú
            zlepšovať služby a personalizovať obsah.
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <strong>Nevyhnutné cookies</strong>
                <div className="text-xs text-gray-300">Potrebné pre základné fungovanie stránky</div>
              </div>
              <span className="text-green-400">✓ Vždy aktívne</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <strong>Analytické cookies</strong>
                <div className="text-xs text-gray-300">Google Analytics - pomáhajú nám pochopiť návštevnosť</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <strong>Marketingové cookies</strong>
                <div className="text-xs text-gray-300">Facebook Pixel, Google Ads - pre relevantné reklamy</div>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-gray-300">
            Podrobnosti nájdete v našich{' '}
            <Link href="/ochrana-osobnych-udajov" className="text-blue-400 hover:text-blue-300 underline">
              zásadách ochrany osobných údajov
            </Link>
          </div>
        </div>
      </CookieConsent>
    );
  }

  return null;
}

export const getCookieConsentDetails = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const details = localStorage.getItem('cookieConsentDetails');
    return details ? JSON.parse(details) : null;
  } catch {
    return null;
  }
};

export const hasConsentFor = (type: 'necessary' | 'analytics' | 'marketing'): boolean => {
  const details = getCookieConsentDetails();
  return details ? details[type] === true : false;
};
