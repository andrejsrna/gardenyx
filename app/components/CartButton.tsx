'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Cart from './Cart';

export default function CartButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { totalItems } = useCart();

  const closeCart = () => setIsOpen(false);

  return (
    <div className="relative">
      <button 
        data-cart-button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-green-600 transition-colors"
      >
        <ShoppingCart className="w-6 h-6" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {totalItems}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeCart}
          />
          <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg z-50">
            <Cart onClose={closeCart} />
          </div>
        </>
      )}
    </div>
  );
} 