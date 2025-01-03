'use client';

import { useCart } from '../context/CartContext';
import CheckoutForm from '../components/CheckoutForm';

export default function CheckoutClient() {
  const { items } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Váš košík je prázdny</h1>
        <p className="text-gray-600 mb-8">Pridajte produkty do košíka pre pokračovanie v nákupe.</p>
      </div>
    );
  }

  return <CheckoutForm />;
} 