'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import { useLocale } from 'next-intl';

interface PacketaWidgetPoint {
  id: string;
  name: string;
  city: string;
  street: string;
  zip: string;
  country: string;
}

declare global {
  interface Window {
    Packeta: {
      Widget: {
        pick: (
          apiKey: string,
          callback: (point: PacketaWidgetPoint | null) => void,
          options: {
            country: string;
            language: string;
          }
        ) => void;
      };
    };
  }
}

interface PacketaPointSelectorProps {
  country?: string;
  onSelectAction: (point: {
    id: string;
    name: string;
    street: string;
    city: string;
    zip: string;
  }) => void;
  onCloseAction?: () => void;
}

export default function PacketaPointSelector({ country = 'SK', onSelectAction, onCloseAction }: PacketaPointSelectorProps) {
  const locale = useLocale();
  const onSelectRef = useRef(onSelectAction);
  const onCloseRef = useRef(onCloseAction);
  onSelectRef.current = onSelectAction;
  onCloseRef.current = onCloseAction;

  const openWidget = () => {
    if (!window.Packeta?.Widget?.pick) return;

    const widgetCountry = country.toLowerCase();
    const widgetLanguage = locale === 'hu' ? 'hu' : locale === 'en' ? 'en' : widgetCountry === 'cz' ? 'cs' : 'sk';

    window.Packeta.Widget.pick(
      process.env.NEXT_PUBLIC_PACKETA_API_KEY!,
      (point: PacketaWidgetPoint | null) => {
        if (point) {
          onSelectRef.current({
            id: point.id,
            name: point.name,
            street: point.street,
            city: point.city,
            zip: point.zip,
          });
        } else {
          onCloseRef.current?.();
        }
      },
      {
        country: widgetCountry,
        language: widgetLanguage,
      }
    );
  };

  useEffect(() => {
    if (typeof window.Packeta !== 'undefined') {
      openWidget();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Script
        src="https://widget.packeta.com/v6/www/js/library.js"
        strategy="afterInteractive"
        onLoad={openWidget}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => onCloseRef.current?.()}>
        <div
          className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => onCloseRef.current?.()}
            className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            aria-label="Zavrieť"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h3 className="text-lg font-semibold mb-1 pr-8">Vyberte výdajné miesto</h3>
          <p className="text-sm text-gray-500 mb-4">Načítavam Packeta widget...</p>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
          <button
            type="button"
            onClick={() => onCloseRef.current?.()}
            className="w-full mt-2 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Zavrieť
          </button>
        </div>
      </div>
    </>
  );
}
