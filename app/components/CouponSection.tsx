'use client';

import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { tracking } from '../lib/tracking';

const CouponIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const RemoveIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function CouponSection() {
  const { appliedCoupon, applyCoupon, removeCoupon, discountAmount } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    setIsLoading(true);
    try {
      const success = await applyCoupon(inputValue.trim());
      if (success) {
        tracking.custom('coupon_applied', { code: inputValue.trim() });
      }
      setInputValue('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
  };

  return (
    <div className="relative mb-8">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-2xl opacity-60"></div>
      <div className="absolute top-2 right-2 w-20 h-20 bg-green-200/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-2 left-2 w-16 h-16 bg-emerald-200/20 rounded-full blur-xl"></div>
      
      <div className="relative backdrop-blur-sm bg-white/70 rounded-2xl border border-white/40 shadow-lg p-6">
        {appliedCoupon ? (
          // Applied coupon state
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                <CheckIcon />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Zľavový kupón:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                    {appliedCoupon}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    Ušetríte: <span className="font-semibold">-{discountAmount.toFixed(2)} €</span>
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="group flex items-center justify-center w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-all duration-200 hover:scale-105"
              title="Odstrániť kupón"
            >
              <RemoveIcon />
            </button>
          </div>
        ) : (
          // Coupon input form
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                <CouponIcon />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Máte zľavový kupón?</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Zadajte váš zľavový kód"
                  className="w-full px-4 py-3 text-sm font-medium bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 placeholder-gray-500"
                  aria-label="Zľavový kód"
                  disabled={isLoading}
                />
                {inputValue && (
                  <button
                    type="button"
                    onClick={() => setInputValue('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <RemoveIcon />
                  </button>
                )}
              </div>
              
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="group relative w-full overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                <div className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Overujem...</span>
                    </>
                  ) : (
                    <>
                      <CouponIcon />
                      <span>Použiť kupón</span>
                    </>
                  )}
                </div>
              </button>
            </form>
            
            <p className="text-xs text-gray-500 mt-3 text-center">
              💡 Tip: Kupóny môžete získať pri odbere newsletteru alebo počas špeciálnych akcií
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
