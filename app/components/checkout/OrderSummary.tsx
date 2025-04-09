'use client';

import React from 'react';
import type { CartItem } from '../../context/CartContext'; // Adjust path as needed

interface OrderSummaryProps {
  items: CartItem[];
  totalPrice: number;
  shippingCost: number;
  discountAmount: number;
  appliedCoupon: string | null;
  finalTotal: number;
  shippingMethodSelected: boolean; // To conditionally show shipping cost
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  totalPrice,
  shippingCost,
  discountAmount,
  appliedCoupon,
  finalTotal,
  shippingMethodSelected,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Zhrnutie objednávky</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between items-center text-sm">
            <div>
              <span className="font-medium text-gray-800">{item.name}</span>
              <span className="text-gray-500 ml-2">x {item.quantity}</span>
            </div>
            <div className="font-medium text-gray-800">
              {(Number(item.price) * item.quantity).toFixed(2)} €
            </div>
          </div>
        ))}
        <div className="border-t border-dashed pt-3 space-y-2">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Medzisúčet</span>
            <span>{totalPrice.toFixed(2)} €</span>
          </div>
          {appliedCoupon && discountAmount > 0 && (
            <div className="flex justify-between items-center text-sm text-green-600">
              <span>Zľavový kupón ({appliedCoupon})</span>
              <span>-{discountAmount.toFixed(2)} €</span>
            </div>
          )}
          {shippingMethodSelected && (
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Doprava</span>
              <span>{shippingCost > 0 ? `${shippingCost.toFixed(2)} €` : 'Zadarmo'}</span>
            </div>
          )}
          {/* Optional COD fee summary could be added here if applicable */}
        </div>
        <div className="border-t pt-3 flex justify-between items-center font-bold">
          <div>
            <span>Celkom k úhrade</span>
            <div className="text-xs font-normal text-gray-500">Cena vrátane DPH</div>
          </div>
          <span className="text-lg text-green-600">{finalTotal.toFixed(2)} €</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
