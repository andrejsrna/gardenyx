'use client';

import { useEffect, useState } from 'react';
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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    if (!window.Packeta?.Widget?.pick) return;

    const widgetCountry = country.toLowerCase();
    const widgetLanguage = locale === 'hu' ? 'hu' : locale === 'en' ? 'en' : widgetCountry === 'cz' ? 'cs' : 'sk';

    window.Packeta.Widget.pick(
      process.env.NEXT_PUBLIC_PACKETA_API_KEY!,
      (point: PacketaWidgetPoint | null) => {
        if (point) {
          onSelectAction({
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
  }, [loaded, locale, country, onSelectAction]);

  return (
    <>
      <Script
        src="https://widget.packeta.com/v6/www/js/library.js"
        strategy="afterInteractive"
        onLoad={() => setLoaded(true)}
      />
      <div className="w-full h-32 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    </>
  );
}
