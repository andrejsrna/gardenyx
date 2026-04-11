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
}

export default function PacketaPointSelector({ country = 'SK', onSelectAction }: PacketaPointSelectorProps) {
  const locale = useLocale();
  const openedRef = useRef(false);
  const onSelectRef = useRef(onSelectAction);
  onSelectRef.current = onSelectAction;

  const openWidget = () => {
    if (openedRef.current) return;
    if (!window.Packeta?.Widget?.pick) return;
    openedRef.current = true;

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
        }
      },
      {
        country: widgetCountry,
        language: widgetLanguage,
      }
    );
  };

  // Ak je skript už načítaný (druhý mount), otvoríme widget hneď
  useEffect(() => {
    if (window.Packeta?.Widget?.pick) {
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
      <div className="w-full h-32 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    </>
  );
}
