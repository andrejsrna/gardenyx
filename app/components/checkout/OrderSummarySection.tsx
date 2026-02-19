'use client';

import { FormEvent } from 'react';
import Image from 'next/image';
import type { FormData } from '../../lib/checkout/types';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST_PACKETA_PICKUP, SHIPPING_COST_PACKETA_HOME } from '../../lib/checkout/constants';
import { isSalesSuspendedClient } from '../../lib/utils/sales-suspension';
import { useCart } from '../../context/CartContext';
import CouponSection from '../CouponSection';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sku?: string;
  slug?: string;
}

interface OrderSummarySectionProps {
  cartItems: CartItem[];
  formData: FormData;
  isLoading: boolean;
  isFormValid: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCustomerNoteChange: (note: string) => void;
  onRemoveItem: (id: number) => void;
  discountAmount?: number;
  appliedCoupon?: string | null;
  couponFreeShipping?: boolean;
}

export default function OrderSummarySection({
  cartItems,
  formData,
  isLoading,
  isFormValid,
  onSubmit,
  onCustomerNoteChange,
  onRemoveItem,
  discountAmount = 0,
  appliedCoupon = null,
  couponFreeShipping = false,
}: OrderSummarySectionProps) {
  const { couponType, manualDiscountLabel } = useCart();
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
  const isFreeShipping = couponFreeShipping || subtotal >= FREE_SHIPPING_THRESHOLD;
  const isSalesSuspended = isSalesSuspendedClient();
  const VAT_RATE = 0.19;
  const netSubtotal = subtotalAfterDiscount / (1 + VAT_RATE);
  const vatAmount = subtotalAfterDiscount - netSubtotal;
  
  const getShippingCostBase = () => {
    if (isFreeShipping) return 0;
    if (formData.shipping_method === 'packeta_pickup') return SHIPPING_COST_PACKETA_PICKUP;
    if (formData.shipping_method === 'packeta_home') return SHIPPING_COST_PACKETA_HOME;
    return null;
  };
  
  const shippingCostBase = getShippingCostBase(); // základ bez DPH
  const shippingCostWithVat = shippingCostBase ? shippingCostBase * 1.19 : 0; // s DPH
  const shippingVat = shippingCostBase ? shippingCostBase * 0.19 : 0; // len DPH
  const total = Math.max(0, subtotalAfterDiscount + shippingCostWithVat);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm sticky top-20">
      <h2 className="text-xl font-semibold mb-2">Súhrn objednávky</h2>
      <div className="text-xs text-gray-500 mb-4">Ceny sú uvedené vrátane DPH 19%.</div>

      {/* Cart Items */}
      <div className="space-y-3 mb-4">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-xs overflow-hidden">
              {item.image ? (
                <Image 
                  src={item.image} 
                  alt={item.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              ) : (
                'IMG'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
              <p className="text-xs text-gray-500">Množstvo: {item.quantity}</p>
            </div>
            <div className="text-sm font-medium text-gray-900 pr-2">
              {(item.price * item.quantity).toFixed(2)} €
            </div>
            <button 
              type="button"
              onClick={() => onRemoveItem(item.id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
              aria-label={`Odstrániť ${item.name}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <CouponSection />
      </div>

      <div className="border-t pt-4 space-y-2">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Medzisúčet (vrátane DPH 19%)</span>
          <span className="font-medium">{subtotal.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Základ bez DPH</span>
          <span>{(subtotal / (1 + VAT_RATE)).toFixed(2)} €</span>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>DPH (19%)</span>
          <span>{(subtotal - subtotal / (1 + VAT_RATE)).toFixed(2)} €</span>
        </div>
        {discountAmount > 0 && (
          <>
            <div className="flex justify-between text-sm text-green-700">
              <span>
                {couponType === 'manual'
                  ? (manualDiscountLabel || 'Zľava za kúru')
                  : `Zľava${appliedCoupon ? ` (${appliedCoupon})` : ''}`}
              </span>
              <span className="font-medium">- {discountAmount.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Nový medzisúčet po zľave (vrátane DPH)</span>
              <span>{subtotalAfterDiscount.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Základ po zľave bez DPH</span>
              <span>{netSubtotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>DPH po zľave (19%)</span>
              <span>{vatAmount.toFixed(2)} €</span>
            </div>
          </>
        )}
        
        {/* Shipping */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Doprava (vrátane DPH)</span>
          <span className="font-medium">
            {shippingCostBase === null 
              ? <span className="text-xs text-gray-500">Spôsob dopravy zatiaľ nebol vybraný</span> 
              : shippingCostBase === 0 
              ? 'Zadarmo' 
              : `${shippingCostWithVat.toFixed(2)} €`}
          </span>
        </div>
        {shippingCostBase !== null && shippingCostBase > 0 && (
          <>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Základ bez DPH</span>
              <span>{shippingCostBase.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>DPH dopravy (19%)</span>
              <span>{shippingVat.toFixed(2)} €</span>
            </div>
          </>
        )}
        
        {/* Free shipping progress */}
        {!isFreeShipping && subtotal > 0 && !couponFreeShipping && (
          <div className="text-xs text-gray-500">
            Nakúpte ešte za {Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} € a získate dopravu zdarma
          </div>
        )}
      </div>
      
      <div className="border-t mt-4 pt-4">
        <div className="flex justify-between text-lg font-semibold">
          <span>Celkom</span>
          <span className="text-green-600">{total.toFixed(2)} €</span>
        </div>
      </div>
      
      {/* Customer Note */}
      <div className="mt-4">
        <label htmlFor="customer_note" className="block text-sm font-medium text-gray-700 mb-2">
          Poznámka k objednávke (nepovinné)
        </label>
        <textarea
          id="customer_note"
          name="customer_note"
          value={formData.customer_note}
          onChange={(e) => onCustomerNoteChange(e.target.value)}
          rows={3}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm"
          placeholder="Akékoľvek špeciálne pokyny pre vašu objednávku..."
        />
      </div>
      
      {/* Submit Button */}
      <form onSubmit={onSubmit} className="mt-6">
        <button
          type="submit"
          disabled={!isFormValid || isLoading || isSalesSuspended}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
            isFormValid && !isLoading && !isSalesSuspended
              ? 'bg-green-600 hover:bg-green-700 transform hover:scale-[1.02] shadow-lg hover:shadow-xl'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Objednávka sa spracúva...</span>
            </div>
          ) : isSalesSuspended ? (
            <span>Predaje pozastavené</span>
          ) : (
            <span>Dokončiť objednávku • {total.toFixed(2)} €</span>
          )}
        </button>
      </form>
      
      {/* Security badges */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>SSL šifrovanie</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Bezpečná platba</span>
        </div>
      </div>
    </div>
  );
} 
