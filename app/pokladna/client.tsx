'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import CheckoutForm from '../components/CheckoutForm';
import { useCart } from '../context/CartContext';

// Deklarácia pre TypeScript
declare global {
  interface Window {
    checkoutFormLoading?: boolean;
  }
}

export default function CheckoutClient() {
  const { items } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pridáme efekt, ktorý nastaví loading na false po načítaní
  useEffect(() => {
    // Krátke oneskorenie, aby sa zabránilo blikaniu
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Zvýšime oneskorenie pre istotu

    return () => clearTimeout(timer);
  }, []);

  // Sledujeme stav loading z CheckoutForm
  useEffect(() => {
    const checkFormLoading = () => {
      setIsSubmitting(!!window.checkoutFormLoading);
    };

    // Kontrolujeme stav každých 100ms
    const interval = setInterval(checkFormLoading, 100);

    // Kontrolujeme stav aj okamžite
    checkFormLoading();

    return () => clearInterval(interval);
  }, []);

  // Vytvoríme loading overlay, ktorý bude fixne umiestnený na obrazovke
  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
        <Loader2 className="h-16 w-16 animate-spin text-green-600 mb-4" />
        <h2 className="text-xl font-medium text-gray-800">
          {isSubmitting ? 'Spracovávam objednávku...' : 'Načítavam objednávku...'}
        </h2>
      </div>
    </div>
  );

  // Ak je košík prázdny a nie je v stave načítavania alebo odosielania
  if (items.length === 0 && !isLoading && !isSubmitting) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Váš košík je prázdny</h1>
        <p className="text-gray-600 mb-8">Pridajte produkty do košíka pre pokračovanie v nákupe.</p>
      </div>
    );
  }

  // Vždy zobrazíme CheckoutForm (aj keď je prázdny košík, ale je v stave loading)
  // a ak je loading, zobrazíme aj overlay
  return (
    <>
      {(isLoading || isSubmitting) && <LoadingOverlay />}
      <CheckoutForm />
    </>
  );
}
