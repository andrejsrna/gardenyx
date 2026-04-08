"use client";

import { useEffect, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function SuccessLanding() {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'sk';

  const id = useMemo(() => {
    const pi = params.get('payment_intent');
    const cs = params.get('payment_intent_client_secret');
    return pi || (cs ? cs.split('_secret')[0] : null);
  }, [params]);

  useEffect(() => {
    if (!id) {
      router.replace(`/${locale}`);
      return;
    }
    let attempts = 0;
    const timer = setInterval(async () => {
      attempts += 1;
      try {
        const res = await fetch(`/api/orders?payment_intent=${encodeURIComponent(id)}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data?.order?.id || data?.orderId) {
            clearInterval(timer);
            const oid = data.order?.id || data.orderId;
            router.replace(`/${locale}/objednavka/uspesna/${oid}`);
          }
        }
      } catch {}
      if (attempts >= 15) {
        clearInterval(timer);
        router.replace(`/${locale}/objednavka/spracovava-sa?pi=${id}`);
      }
    }, 600);
    return () => clearInterval(timer);
  }, [id, router, locale]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto" />
        <p className="mt-3 text-sm text-gray-600">Finalizujem objednávku...</p>
      </div>
    </div>
  );
}

