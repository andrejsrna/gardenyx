'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

type Props = {
  initialEnabled: boolean;
  adminToken?: string;
};

export default function ReactivationToggle({ initialEnabled, adminToken }: Props) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const toggle = (next: boolean) => {
    setEnabled(next);
    startTransition(async () => {
      try {
        const res = await fetch('/api/admin/feature-flags/reactivation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(adminToken ? { 'x-admin-token': adminToken } : {}),
          },
          body: JSON.stringify({ enabled: next }),
        });
        if (!res.ok) {
          throw new Error(`Status ${res.status}`);
        }
        const data = await res.json();
        setEnabled(Boolean(data.enabled));
        setError(null);
      } catch {
        setError('Nepodarilo sa uložiť. Skúste znova.');
        setEnabled((prev) => !next ? prev : prev); // keep previous
      }
    });
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Reaktivácia 30–45 dní</p>
          <p className="text-xs text-slate-300">Flow: jemný návrat pre neaktívnych po 30–45 dňoch.</p>
          <ul className="mt-2 text-xs text-slate-200 space-y-1">
            <li>Predmet: „Ako sa dnes majú tvoje kĺby?“</li>
            <li>Obsah: empatický tón, otázka, nie predaj</li>
            <li>CTA: „Máme pre teba tip“</li>
          </ul>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={enabled}
            disabled={isPending}
            onChange={(e) => toggle(e.target.checked)}
          />
          <div className="peer h-6 w-11 rounded-full bg-slate-700 after:absolute after:left-[4px] after:top-[3px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-emerald-500 peer-checked:after:translate-x-[18px]" />
        </label>
      </div>
      {isPending && <p className="mt-2 text-xs text-emerald-200">Ukladám…</p>}
      {error && <p className="mt-2 text-xs text-amber-200">{error}</p>}
      <button
        type="button"
        onClick={async () => {
          try {
            const res = await fetch('/api/admin/reactivation/test', {
              method: 'POST',
              headers: {
                ...(adminToken ? { 'x-admin-token': adminToken } : {}),
              },
            });
            if (!res.ok) {
              throw new Error(`Status ${res.status}`);
            }
            toast.success('Test email odoslaný na ahoj@andrejsrna.sk');
          } catch (err) {
            console.error(err);
            toast.error('Test email sa nepodarilo odoslať');
          }
        }}
        className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/60 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-500/25"
      >
        Poslať test (ahoj@andrejsrna.sk)
      </button>
    </div>
  );
}
