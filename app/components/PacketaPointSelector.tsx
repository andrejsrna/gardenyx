'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import type { PacketaPoint } from '../lib/packeta';

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
  onSelect: (point: PacketaPoint) => void;
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
              // Convert to PacketaPoint type
              const packetaPoint: PacketaPoint = {
                ...point,
                type: 'PACKETA_POINT'
              };
              onSelect(packetaPoint);
            }
          },
          {
            country: 'sk',
            language: 'sk'
          }
        );
      }
    };

    showPacketaWidget();
  }, [onSelect]);

  return null;
} 