'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

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
  onSelectAction: (point: {
    id: string;
    name: string;
    street: string;
    city: string;
    zip: string;
  }) => void;
}

export default function PacketaPointSelector({ onSelectAction }: PacketaPointSelectorProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    if (!window.Packeta?.Widget?.pick) return;

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
        country: 'sk',
        language: 'sk',
      }
    );
  }, [loaded, onSelectAction]);

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
