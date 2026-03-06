'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function RecoverOrderForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentIntentId.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/recover-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId: paymentIntentId.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Nepodarilo sa obnoviť objednávku');
      }

      toast.success(data.message || 'Objednávka bola úspešne obnovená');
      setPaymentIntentId('');
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Neznáma chyba');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
      >
        Obnoviť zo Stripe (PI)
      </button>
    );
  }

  return (
    <form onSubmit={handleRecover} className="flex items-center gap-2">
      <input
        type="text"
        placeholder="pi_3T7..."
        value={paymentIntentId}
        onChange={(e) => setPaymentIntentId(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-64"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !paymentIntentId.trim()}
        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
      >
        {isLoading ? 'Spracúvam...' : 'Obnoviť'}
      </button>
      <button
        type="button"
        onClick={() => setIsOpen(false)}
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
        disabled={isLoading}
      >
        Zrušiť
      </button>
    </form>
  );
}
