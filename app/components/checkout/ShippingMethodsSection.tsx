'use client';

import { ChangeEvent } from 'react';
import type { FormData, PacketaPoint } from '../../lib/checkout/types';
import { SHIPPING_COST_PACKETA_PICKUP, SHIPPING_COST_PACKETA_HOME, FREE_SHIPPING_THRESHOLD } from '../../lib/checkout/constants';
import Link from 'next/link';

interface ShippingMethodsSectionProps {
  formData: FormData;
  formErrors: Record<string, string[] | undefined> | null;
  cartTotal: number;
  selectedPacketaPoint: PacketaPoint | null;
  onInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    section: 'billing' | 'shipping' | 'consents' | 'root'
  ) => void;
  onPacketaPointSelect: () => void;
}

export default function ShippingMethodsSection({
  formData,
  formErrors,
  cartTotal,
  selectedPacketaPoint,
  onInputChange,
  onPacketaPointSelect,
}: ShippingMethodsSectionProps) {
  const isFreeShipping = cartTotal >= FREE_SHIPPING_THRESHOLD;

  const shippingMethods = [
    {
      id: 'packeta_pickup',
      title: 'Packeta - Výdajné miesto',
      price: isFreeShipping ? 0 : SHIPPING_COST_PACKETA_PICKUP,
      description: 'Doručenie na výdajné miesto Packeta',
      icon: '📦',
    },
    {
      id: 'packeta_home',
      title: 'Packeta - Doručenie domov',
      price: isFreeShipping ? 0 : SHIPPING_COST_PACKETA_HOME,
      description: 'Doručenie kuriérom priamo na adresu',
      icon: '🚚',
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-2">Spôsob dopravy</h2>
      <div className="mb-4">
        <Link href="/doprava-a-platba#ako-funguje-packeta" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-800 underline">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
          </svg>
          <span>Ako funguje Packeta?</span>
        </Link>
      </div>
      
      {isFreeShipping && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 font-medium">Máte nárok na dopravu zdarma.</p>
        </div>
      )}
      
      <div className="space-y-3">
        {shippingMethods.map((method) => (
          <div key={method.id} className="relative">
            <label
              className="flex p-4 border rounded-lg cursor-pointer transition-colors has-[:checked]:border-green-600 has-[:checked]:bg-green-50/50"
            >
              <input
                type="radio"
                name="shipping_method"
                value={method.id}
                checked={formData.shipping_method === method.id}
                onChange={(e) => {
                  onInputChange(e, 'root');
                  if (method.id === 'packeta_pickup' && !selectedPacketaPoint) {
                    onPacketaPointSelect();
                  }
                }}
                className="h-4 w-4 mt-1 text-green-600 focus:ring-green-500 border-gray-300"
                required
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{method.icon}</span>
                  <span className="font-medium text-gray-900">{method.title}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{method.description}</p>
                <p className="text-base font-bold text-green-600 mt-2">
                  {method.price === 0 ? 'Zadarmo' : `${method.price.toFixed(2)} €`}
                </p>
              </div>
            </label>
            
            {method.id === 'packeta_pickup' && formData.shipping_method === 'packeta_pickup' && (
              <div className="mt-3 pl-12 pr-4">
                {selectedPacketaPoint ? (
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-3 bg-white border rounded-md">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900 truncate" title={selectedPacketaPoint.name}>
                        {selectedPacketaPoint.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate" title={`${selectedPacketaPoint.street}, ${selectedPacketaPoint.city}, ${selectedPacketaPoint.zip}`}>
                        {selectedPacketaPoint.street}, {selectedPacketaPoint.city}, {selectedPacketaPoint.zip}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onPacketaPointSelect}
                      className="text-green-600 hover:underline font-medium text-sm flex-shrink-0 self-start md:self-center"
                    >
                      Zmeniť
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={onPacketaPointSelect}
                    className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Vybrať výdajné miesto
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {formErrors?.['shipping_method'] && (
        <p className="mt-2 text-sm text-red-600">
          Prosím, vyberte spôsob dopravy
        </p>
      )}
    </div>
  );
} 