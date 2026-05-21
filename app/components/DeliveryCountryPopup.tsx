'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

const STORAGE_KEY = 'gardenyx_delivery_popup_seen';

export default function DeliveryCountryPopup() {
  const t = useTranslations('deliveryPopup');
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem(STORAGE_KEY);
  });

  function close() {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-6xl mb-4">🇸🇰</div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">{t('title')}</h2>
        <p className="text-gray-600 text-sm leading-relaxed mb-6">{t('body')}</p>
        <button
          onClick={close}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          {t('cta')}
        </button>
      </div>
    </div>
  );
}
