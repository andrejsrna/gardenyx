'use client';

import { useState } from 'react';
import { useCookieConsent } from '../context/CookieConsentContext';

export default function CookieConsent() {
  const { consent, setConsent, isModalOpen, setModalOpen } = useCookieConsent();
  const [showDetails, setShowDetails] = useState(false);

  const saveConsent = (newConsent: typeof consent) => {
    setConsent(newConsent);

    const consentString = JSON.stringify(newConsent);

    try {
      localStorage.setItem('cookieConsent', consentString);
    } catch (error) {
      console.error('Failed to set localStorage item:', error);
    }

    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `cookieConsent=${consentString}; path=/; expires=${expires.toUTCString()}; SameSite=Lax${secureFlag}`;
    
    setModalOpen(false);
  };

  const handleAcceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
    });
  };

  const handleRejectAll = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
    });
  };

  const handleSavePreferences = () => {
    saveConsent(consent);
  };

  if (!isModalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex min-h-screen items-start sm:items-center justify-center p-4 text-center">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={(e) => e.stopPropagation()}
        ></div>

        <div className="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900" id="modal-title">
                Nastavenia cookies
              </h2>
              <p className="text-gray-600">
                Používame cookies na zlepšenie vášho zážitku z nakupovania a na analýzu návštevnosti.
                Niektoré z nich sú nevyhnutné pre fungovanie stránky, zatiaľ čo iné nám pomáhajú
                zlepšovať služby a personalizovať obsah.
              </p>

              {showDetails && (
                <div className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Nevyhnutné cookies</h3>
                      <p className="text-sm text-gray-500">
                        Potrebné pre základné fungovanie stránky
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={consent.necessary}
                      disabled
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Analytické cookies</h3>
                      <p className="text-sm text-gray-500">
                        Google Analytics - pomáhajú nám pochopiť, ako používate našu stránku
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={consent.analytics}
                      onChange={(e) => setConsent({ ...consent, analytics: e.target.checked })}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Marketingové cookies</h3>
                      <p className="text-sm text-gray-500">
                        Facebook Pixel, Google Ads - pomáhajú nám zobrazovať relevantné reklamy
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={consent.marketing}
                      onChange={(e) => setConsent({ ...consent, marketing: e.target.checked })}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={handleRejectAll}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Odmietnuť všetko
                </button>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  {showDetails ? 'Skryť nastavenia' : 'Upraviť nastavenia'}
                </button>
                {showDetails ? (
                  <button
                    onClick={handleSavePreferences}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    Uložiť nastavenia
                  </button>
                ) : (
                  <button
                    onClick={handleAcceptAll}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    Prijať všetko
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
