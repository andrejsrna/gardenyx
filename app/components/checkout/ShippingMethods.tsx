'use client';

import React, { ChangeEvent } from 'react';

interface ShippingMethodsProps {
  selectedMethod: string;
  packetaPointName?: string; // Name of the selected Packeta point
  totalPrice: number; // To determine free shipping
  freeShippingThreshold: number;
  costPacketaPickup: number;
  costPacketaHome: number;
  onMethodChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onShowPacketaSelector: () => void; // Function to open the selector modal
}

const ShippingMethods: React.FC<ShippingMethodsProps> = ({
  selectedMethod,
  packetaPointName,
  totalPrice,
  freeShippingThreshold,
  costPacketaPickup,
  costPacketaHome,
  onMethodChange,
  onShowPacketaSelector,
}) => {
  const isFreeShipping = totalPrice >= freeShippingThreshold;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Spôsob dopravy <span className="text-red-500">*</span></h2>
      <div className="space-y-3">
        {/* Packeta Pickup Point */}
        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 has-[:checked]:bg-green-50 has-[:checked]:border-green-300">
          <input
            type="radio"
            name="shipping_method"
            value="packeta_pickup"
            checked={selectedMethod === 'packeta_pickup'}
            onChange={onMethodChange}
            className="mt-1 rounded-full border-gray-300 text-green-600 focus:ring-green-500"
            required
          />
          <div className="flex-1">
            <div className="font-medium">Packeta - Výdajné miesto</div>
            <div className="text-sm text-gray-500">
              Doručenie na výdajné miesto alebo Z-BOX
              {isFreeShipping ? (
                <span className="ml-2 text-green-600 font-medium">Zadarmo</span>
              ) : (
                <span className="ml-2 font-medium">{costPacketaPickup.toFixed(2)} €</span>
              )}
            </div>
            {selectedMethod === 'packeta_pickup' && (
              <div className="mt-2">
                {packetaPointName ? (
                  <>
                    <div className="text-sm text-green-700 font-medium">
                      Vybrané: {packetaPointName}
                    </div>
                    <button
                      type="button"
                      onClick={onShowPacketaSelector}
                      className="mt-1 text-sm text-green-600 hover:text-green-700 underline"
                    >
                      Zmeniť miesto
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={onShowPacketaSelector}
                    className="mt-1 text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
                  >
                    Vybrať výdajné miesto
                  </button>
                )}
              </div>
            )}
          </div>
        </label>
        {/* Packeta Home Delivery */}
        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 has-[:checked]:bg-green-50 has-[:checked]:border-green-300">
          <input
            type="radio"
            name="shipping_method"
            value="packeta_home"
            checked={selectedMethod === 'packeta_home'}
            onChange={onMethodChange}
            className="mt-1 rounded-full border-gray-300 text-green-600 focus:ring-green-500"
            required
          />
          <div className="flex-1">
            <div className="font-medium">Packeta - Doručenie na adresu</div>
            <div className="text-sm text-gray-500">
              Doručenie kuriérom na vašu adresu
              {isFreeShipping ? (
                <span className="ml-2 text-green-600 font-medium">Zadarmo</span>
              ) : (
                <span className="ml-2 font-medium">{costPacketaHome.toFixed(2)} €</span>
              )}
            </div>
          </div>
        </label>
      </div>
      {!isFreeShipping && selectedMethod && (
        <div className="mt-4 text-xs text-gray-500">
          Pri nákupe nad {freeShippingThreshold} € je doprava zadarmo.
        </div>
      )}
    </div>
  );
};

export default ShippingMethods;
