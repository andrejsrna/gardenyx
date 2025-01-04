'use client';

import { useState, useEffect } from 'react';
import { useCookieConsent } from '../context/CookieConsentContext';

export default function CookieConsent() {
  const { consent, setConsent, setModalOpen, isModalOpen } = useCookieConsent();
  const [showDetails, setShowDetails] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set mounted state to true after hydration
    setMounted(true);

    // Check localStorage for existing consent
    const hasConsent = localStorage.getItem('cookieConsent');
    if (!hasConsent) {
      // Set default consent with all options enabled
      setConsent({
        necessary: true,
        analytics: true,
        marketing: true,
      });
    }
  }, [setConsent]);

  const handleAcceptAll = () => {
    setConsent({
      necessary: true,
      analytics: true,
      marketing: true,
    });
    setModalOpen(false);
  };

  const handleRejectAll = () => {
    setConsent({
      necessary: true,
      analytics: false,
      marketing: false,
    });
    setModalOpen(false);
  };

  const handleSavePreferences = () => {
    setConsent({ ...consent });
    setModalOpen(false);
  };

  // Don't render anything until component is mounted to prevent flash
  if (!mounted) {
    return null;
  }

  // Show only if no consent is stored or modal is explicitly opened
  const hasStoredConsent = localStorage.getItem('cookieConsent');
  if (hasStoredConsent && !isModalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          aria-hidden="true"
          onClick={(e) => e.stopPropagation()}
        ></div>

        <div className="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Nastavenia cookies</h2>
              <p className="text-gray-600">
                Používame cookies na zlepšenie vášho zážitku z nakupovania a na analýzu návštevnosti. 
                Niektoré z nich sú nevyhnutné pre fungovanie stránky, zatiaľ čo iné nám pomáhajú 
                zlepšovať služby a personalizovať obsah.
              </p>

              {/* Always show cookie settings when opened via manager */}
              {(showDetails || isModalOpen) && (
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
                {!isModalOpen && (
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    {showDetails ? 'Skryť nastavenia' : 'Upraviť nastavenia'}
                  </button>
                )}
                {(showDetails || isModalOpen) ? (
                  <button
                    onClick={handleSavePreferences}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    Uložiť nastavenia
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleRejectAll}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Odmietnuť všetko
                    </button>
                    <button
                      onClick={handleAcceptAll}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                    >
                      Prijať všetko
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 