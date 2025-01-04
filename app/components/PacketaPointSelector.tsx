'use client';

import { useEffect } from 'react';
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
  onSelect: (point: {
    id: string;
    name: string;
    street: string;
    city: string;
    zip: string;
  }) => void;
}

export default function PacketaPointSelector({ onSelect }: PacketaPointSelectorProps) {
  useEffect(() => {
    // Show Packeta Widget when component mounts
    const showPacketaWidget = () => {
      if (window.Packeta) {
        window.Packeta.Widget.pick(
          process.env.NEXT_PUBLIC_PACKETA_API_KEY!,
          (point: PacketaWidgetPoint | null) => {
            if (point) {
              onSelect({
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
      }
    };

    // Show widget after a short delay to ensure it's properly initialized
    const timer = setTimeout(showPacketaWidget, 500);

    return () => clearTimeout(timer);
  }, [onSelect]);

  return (
    <>
      <Script
        src="https://widget.packeta.com/v6/www/js/library.js"
        onLoad={() => {
        }}
      />
      <div className="w-full h-32 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    </>
  );
} 