'use client';

import { useEffect, useState } from 'react';
import { safeRemoveItem, safeSetItem } from '@eshop-core/utils/safe-local-storage';

const CHECKOUT_PATH: Record<string, string> = { sk: '/sk/pokladna', en: '/en/checkout', hu: '/hu/penztar' };
const SHOP_PATH: Record<string, string> = { sk: '/sk/kupit', en: '/en/shop', hu: '/hu/vasarlas' };
const TEXT: Record<string, { loading: string; title: string; body: string; cta: string }> = {
  sk: { loading: 'Obnovujeme váš košík…', title: 'Košík sa nepodarilo obnoviť', body: 'Odkaz už neplatí. Produkty si môžete vybrať znova.', cta: 'Prejsť do obchodu' },
  en: { loading: 'Restoring your cart…', title: 'We could not restore your cart', body: 'The link is no longer valid. You can choose the products again.', cta: 'Go to the shop' },
  hu: { loading: 'Visszaállítjuk a kosarát…', title: 'A kosarat nem sikerült visszaállítani', body: 'A link már nem érvényes. A termékeket újra kiválaszthatja.', cta: 'Tovább az áruházba' },
};

export default function RestoreCart({ token, locale }: { token: string; locale: string }) {
  const [failed, setFailed] = useState(false);
  const text = TEXT[locale] ?? TEXT.sk;

  useEffect(() => {
    fetch(`/api/cart/abandoned?token=${encodeURIComponent(token)}`)
      .then(res => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then(({ items }: { items: unknown[] }) => {
        if (!items?.length) throw new Error('empty');
        safeSetItem('cart', JSON.stringify(items));
        ['appliedCoupon', 'manualDiscountLabel', 'manualDiscountKey', 'pendingCoupon'].forEach(safeRemoveItem);
        // Full reload so CartContext re-reads localStorage.
        window.location.replace(`${CHECKOUT_PATH[locale] ?? CHECKOUT_PATH.sk}?utm_source=email&utm_medium=email&utm_campaign=abandoned_cart`);
      })
      .catch(() => setFailed(true));
  }, [token, locale]);

  return (
    <main className="max-w-md mx-auto px-6 py-24 text-center">
      {failed ? (
        <>
          <h1 className="text-2xl font-bold mb-3">{text.title}</h1>
          <p className="text-gray-600 mb-6">{text.body}</p>
          <a href={SHOP_PATH[locale] ?? SHOP_PATH.sk} className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg">{text.cta}</a>
        </>
      ) : (
        <p className="text-gray-600">{text.loading}</p>
      )}
    </main>
  );
}
