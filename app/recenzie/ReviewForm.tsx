'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

const Star = ({ filled }: { filled: boolean }) => (
  <svg className={`w-7 h-7 ${filled ? 'text-yellow-400' : 'text-gray-200'}`} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.402c.499.036.701.663.321.988l-4.204 3.6a.563.563 0 00-.182.557l1.29 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.387 20.5a.562.562 0 01-.84-.61l1.29-5.385a.563.563 0 00-.182-.557l-4.204-3.6a.563.563 0 01.321-.988l5.518-.402a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
);

export default function ReviewForm() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successCoupon, setSuccessCoupon] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    const urlToken = tokenFromUrl || new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('token') || '';
    if (urlToken) setToken(urlToken);
  }, [tokenFromUrl]);

  const canSubmit = useMemo(() => {
    return token.trim().length >= 6 && name.trim().length >= 2 && content.trim().length >= 10 && rating >= 1 && consent;
  }, [token, name, content, rating, consent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error('Doplňte prosím všetky polia a potvrďte súhlas so spracovaním údajov.');
      return;
    }
    setIsSubmitting(true);
    setSuccessCoupon(null);
    try {
      const res = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token.trim(),
          rating,
          name: name.trim(),
          content: content.trim()
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error || 'Nepodarilo sa odoslať recenziu.');
        return;
      }
      if (data.couponCode) {
        setSuccessCoupon(data.couponCode);
        toast.success('Ďakujeme za recenziu! Kupón sme poslali aj emailom.');
      } else {
        toast.success('Ďakujeme za recenziu!');
      }
      setContent('');
      setName('');
    } catch {
      toast.error('Nepodarilo sa odoslať recenziu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white border border-green-100 shadow-xl shadow-green-50/70 rounded-2xl p-6 md:p-8">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-green-700">Recenzný formulár</p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Podeľ sa o skúsenosť</h2>
          <p className="text-gray-600 mt-2">Použi kód z emailu (alebo zadaj token ručne) a po odoslaní ti pošleme kupón na ďalší nákup.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-green-50 text-green-800 rounded-xl text-sm font-semibold">
          🔒 Len pre tvoju emailovú adresu
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kód z emailu</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Napíš alebo vlož token"
              className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-600 focus:border-transparent px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tvoje meno</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ako ťa máme osloviť?"
              className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-600 focus:border-transparent px-3 py-2"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hodnotenie</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none"
                aria-label={`Hodnotenie ${star} z 5`}
              >
                <Star filled={star <= rating} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tvoja skúsenosť</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ako ti produkt pomohol? Čo si všimol/a?"
            className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-600 focus:border-transparent px-3 py-2 h-32 resize-none"
            required
          />
          <p className="text-sm text-gray-500 mt-1">Minimálne 10 znakov.</p>
        </div>

        <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
          <input
            id="gdpr"
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
            required
          />
          <label htmlFor="gdpr" className="text-sm text-gray-700">
            Súhlasím so spracovaním osobných údajov na účel zverejnenia recenzie a zaslania kupónu.
            <span className="block text-gray-500">Súhlas môžete kedykoľvek odvolať.</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white py-3 rounded-lg font-semibold shadow-lg shadow-green-200 disabled:opacity-50"
        >
          {isSubmitting ? 'Odosielam…' : 'Odoslať recenziu a získať kupón'}
        </button>
      </form>

      {successCoupon && (
        <div className="mt-6 p-4 border border-green-200 bg-green-50 rounded-lg text-center">
          <p className="font-semibold text-green-800 mb-1">Ďakujeme za recenziu!</p>
          <p className="text-gray-700">Tvoj kupón: <span className="font-mono font-bold text-green-700">{successCoupon}</span></p>
          <p className="text-sm text-gray-500 mt-1">Poslali sme ho aj na email.</p>
        </div>
      )}
    </div>
  );
}
