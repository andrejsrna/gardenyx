'use client';

import { useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import CookieConsent, { getCookieConsentValue } from 'react-cookie-consent';
import { safeGetItem } from '../lib/utils/safe-local-storage';

type ConsentDetails = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp?: string;
};

const cookieBannerCopy = {
  sk: {
    acceptAll: 'Prijať všetko',
    declineAll: 'Odmietnuť všetko',
    ariaAccept: 'Prijať všetky cookies',
    ariaDecline: 'Odmietnuť voliteľné cookies',
    title: 'Nastavenia cookies',
    description:
      'Používame cookies na zlepšenie vášho zážitku z nakupovania a na analýzu návštevnosti. Niektoré sú nevyhnutné pre fungovanie stránky, zatiaľ čo iné nám pomáhajú zlepšovať služby a personalizovať obsah.',
    necessaryTitle: 'Nevyhnutné cookies',
    necessaryDescription: 'Potrebné pre základné fungovanie stránky',
    alwaysActive: '✓ Vždy aktívne',
    analyticsTitle: 'Analytické cookies',
    analyticsDescription: 'Google Analytics - pomáhajú nám pochopiť návštevnosť',
    marketingTitle: 'Marketingové cookies',
    marketingDescription: 'Facebook Pixel, Google Ads - pre relevantné reklamy',
    privacyPrefix: 'Podrobnosti nájdete v našich',
    privacyLink: 'zásadách ochrany osobných údajov',
  },
  en: {
    acceptAll: 'Accept all',
    declineAll: 'Decline all',
    ariaAccept: 'Accept all cookies',
    ariaDecline: 'Decline optional cookies',
    title: 'Cookie settings',
    description:
      'We use cookies to improve your shopping experience and analyze traffic. Some are necessary for the website to function, while others help us improve services and personalize content.',
    necessaryTitle: 'Essential cookies',
    necessaryDescription: 'Required for the basic functionality of the website',
    alwaysActive: '✓ Always active',
    analyticsTitle: 'Analytics cookies',
    analyticsDescription: 'Google Analytics - helps us understand traffic',
    marketingTitle: 'Marketing cookies',
    marketingDescription: 'Facebook Pixel, Google Ads - for more relevant ads',
    privacyPrefix: 'Details can be found in our',
    privacyLink: 'privacy policy',
  },
  hu: {
    acceptAll: 'Összes elfogadása',
    declineAll: 'Összes elutasítása',
    ariaAccept: 'Összes cookie elfogadása',
    ariaDecline: 'Opcionális cookie-k elutasítása',
    title: 'Cookie beállítások',
    description:
      'Cookie-kat használunk a vásárlási élmény javítására és a forgalom elemzésére. Néhány szükséges az oldal működéséhez, míg mások segítenek szolgáltatásaink fejlesztésében és a tartalom személyre szabásában.',
    necessaryTitle: 'Szükséges cookie-k',
    necessaryDescription: 'Az oldal alapvető működéséhez szükségesek',
    alwaysActive: '✓ Mindig aktív',
    analyticsTitle: 'Analitikai cookie-k',
    analyticsDescription: 'Google Analytics - segít megérteni a forgalmat',
    marketingTitle: 'Marketing cookie-k',
    marketingDescription: 'Facebook Pixel, Google Ads - relevánsabb hirdetésekhez',
    privacyPrefix: 'A részletek itt találhatók:',
    privacyLink: 'adatvédelmi tájékoztató',
  },
} as const;

const storeConsentDetails = (details: ConsentDetails) => {
  try {
    localStorage.setItem(
      'cookieConsentDetails',
      JSON.stringify({
        ...details,
        timestamp: details.timestamp || new Date().toISOString(),
      }),
    );
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

type ConsentSnapshot = {
  consent: string | null;
  details: ConsentDetails | null;
  isSeznamBrowser: boolean;
};

const EMPTY_CONSENT_SNAPSHOT: ConsentSnapshot = {
  consent: null,
  details: null,
  isSeznamBrowser: false,
};

let cachedConsentSnapshot: ConsentSnapshot = EMPTY_CONSENT_SNAPSHOT;
let cachedConsentDetailsRaw: string | null = null;

export const getCookieConsentDetails = (): ConsentDetails | null => {
  if (typeof window === 'undefined') return null;

  try {
    const details = localStorage.getItem('cookieConsentDetails');
    return details ? JSON.parse(details) as ConsentDetails : null;
  } catch {
    return null;
  }
};

export const getCookieConsentSnapshot = (): ConsentSnapshot => {
  if (typeof window === 'undefined') {
    return EMPTY_CONSENT_SNAPSHOT;
  }

  const isSeznamBrowser = /SeznamBrowser|Seznam|Szn/i.test(window.navigator.userAgent || '');
  const consent = isSeznamBrowser ? null : getCookieConsentValue('cookieConsent') || null;
  const detailsRaw = safeGetItem('cookieConsentDetails');
  let details: ConsentDetails | null = null;

  if (detailsRaw) {
    try {
      details = JSON.parse(detailsRaw) as ConsentDetails;
    } catch {
      details = null;
    }
  }

  if (
    cachedConsentSnapshot.consent === consent &&
    cachedConsentSnapshot.isSeznamBrowser === isSeznamBrowser &&
    cachedConsentDetailsRaw === detailsRaw
  ) {
    return cachedConsentSnapshot;
  }

  cachedConsentDetailsRaw = detailsRaw;
  cachedConsentSnapshot = {
    consent,
    details,
    isSeznamBrowser,
  };

  return cachedConsentSnapshot;
};

export const subscribeToCookieConsentChanges = (onStoreChange: () => void) => {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handler = () => onStoreChange();
  window.addEventListener('storage', handler);
  window.addEventListener('cookie-consent-updated', handler);

  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener('cookie-consent-updated', handler);
  };
};

export default function CookieConsentBanner() {
  const pathname = usePathname();
  const locale = pathname?.split('/').filter(Boolean)[0] ?? 'sk';
  const copy = cookieBannerCopy[locale as keyof typeof cookieBannerCopy] ?? cookieBannerCopy.sk;
  const { consent, details, isSeznamBrowser } = useSyncExternalStore(
    subscribeToCookieConsentChanges,
    getCookieConsentSnapshot,
    getCookieConsentSnapshot,
  );

  const privacyHref =
    locale === 'en'
      ? '/en/privacy-policy'
      : locale === 'hu'
        ? '/hu/adatvedelem'
        : '/sk/ochrana-osobnych-udajov';

  useEffect(() => {
    if (isSeznamBrowser) {
      console.warn('[CookieConsentBanner] Skipping banner on Seznam browser to avoid touch event crash');
      return;
    }

    if (consent && !details && !safeGetItem('cookieConsentDetails')) {
      storeConsentDetails(consent === 'true' ? ACCEPTED_DETAILS : DECLINED_DETAILS);
    }
  }, [consent, details, isSeznamBrowser]);

  const handleAcceptAll = () => {
    storeConsentDetails(ACCEPTED_DETAILS);
    window.dispatchEvent(new Event('cookie-consent-updated'));
    window.location.reload();
  };

  const handleDeclineAll = () => {
    storeConsentDetails(DECLINED_DETAILS);
    window.dispatchEvent(new Event('cookie-consent-updated'));
  };

  if (!isSeznamBrowser && !consent) {
    return (
      <CookieConsent
        location="bottom"
        buttonText={copy.acceptAll}
        declineButtonText={copy.declineAll}
        cookieName="cookieConsent"
        cookieValue="true"
        declineCookieValue="false"
        enableDeclineButton={true}
        flipButtons={true}
        expires={365}
        onAccept={handleAcceptAll}
        onDecline={handleDeclineAll}
        style={{
          background: '#2d3748',
          color: '#fff',
          fontSize: '14px',
          padding: '20px',
        }}
        buttonStyle={{
          backgroundColor: '#10b981',
          color: '#fff',
          fontSize: '14px',
          borderRadius: '6px',
          padding: '10px 20px',
          border: 'none',
          cursor: 'pointer',
        }}
        declineButtonStyle={{
          backgroundColor: '#6b7280',
          color: '#fff',
          fontSize: '14px',
          borderRadius: '6px',
          padding: '10px 20px',
          border: 'none',
          cursor: 'pointer',
          marginRight: '10px',
        }}
        buttonClasses="hover:bg-green-600 transition-colors duration-200"
        declineButtonClasses="hover:bg-gray-600 transition-colors duration-200"
        ariaAcceptLabel={copy.ariaAccept}
        ariaDeclineLabel={copy.ariaDecline}
      >
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">{copy.title}</h3>
          <p className="text-sm leading-relaxed">{copy.description}</p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <strong>{copy.necessaryTitle}</strong>
                <div className="text-xs text-gray-300">{copy.necessaryDescription}</div>
              </div>
              <span className="text-green-400">{copy.alwaysActive}</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <strong>{copy.analyticsTitle}</strong>
                <div className="text-xs text-gray-300">{copy.analyticsDescription}</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <strong>{copy.marketingTitle}</strong>
                <div className="text-xs text-gray-300">{copy.marketingDescription}</div>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-300">
            {copy.privacyPrefix}{' '}
            <Link href={privacyHref} className="text-blue-400 hover:text-blue-300 underline">
              {copy.privacyLink}
            </Link>
          </div>
        </div>
      </CookieConsent>
    );
  }

  return null;
}

export const hasConsentFor = (type: 'necessary' | 'analytics' | 'marketing'): boolean => {
  const details = getCookieConsentDetails();
  return details ? details[type] === true : false;
};
