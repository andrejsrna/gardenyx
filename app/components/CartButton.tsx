'use client';

import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Cart from './Cart';

export default function CartButton() {
  const { totalItems, isCartOpen, openCart, closeCart } = useCart();

  const toggleCart = () => {
    if (isCartOpen) {
      closeCart();
    } else {
      openCart();
    }
  };

  return (
    <div className="relative">
      <button
        data-cart-button
        onClick={toggleCart}
        className="relative p-2 text-gray-600 hover:text-green-600 transition-colors"
        aria-label={`Nákupný košík, ${totalItems} ${totalItems === 1 ? 'položka' : totalItems >= 2 && totalItems <= 4 ? 'položky' : 'položiek'}`}
        aria-expanded={isCartOpen}
      >
        <ShoppingCart className="w-6 h-6" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full" aria-hidden="true">
            {totalItems}
          </span>
        )}
      </button>

      {isCartOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-gradient-to-b from-transparent via-slate-900/45 to-slate-950/60 backdrop-blur-[2px]"
            onClick={closeCart}
          />
          <div
            className={`
              fixed top-16 left-4 right-4 max-h-[75vh] overflow-y-auto
              sm:absolute sm:right-0 sm:left-auto sm:top-full sm:mt-2 sm:max-h-none sm:w-96
              z-50 rounded-lg bg-white shadow-xl
            `}
          >
            <Cart onCloseAction={closeCart} />
          </div>
        </>
      )}
    </div>
  );
}
