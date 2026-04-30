'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  type: string;
  amount: string | null;
  percent: number | null;
  freeShipping: boolean;
  active: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  minOrderTotal: string | null;
  maxUses: number | null;
  usedCount: number;
  maxUsesPerEmail: number | null;
  createdAt: Date;
};

const formatDate = (value: Date | string | null) => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));
};

const EMPTY_FORM = {
  code: '',
  description: '',
  type: 'percent' as 'percent' | 'fixed',
  percent: '',
  amount: '',
  freeShipping: false,
  active: true,
  endsAt: '',
  minOrderTotal: '',
  maxUses: '',
};

export default function CouponsClient({ initialCoupons, adminToken }: { initialCoupons: Coupon[]; adminToken: string }) {
  const router = useRouter();
  const [coupons, setCoupons] = useState(initialCoupons);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const handleToggle = async (coupon: Coupon) => {
    setToggling(coupon.id);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
        body: JSON.stringify({ id: coupon.id, active: !coupon.active }),
      });
      if (res.ok) {
        setCoupons(cs => cs.map(c => c.id === coupon.id ? { ...c, active: !c.active } : c));
      }
    } finally {
      setToggling(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        code: form.code,
        description: form.description || undefined,
        type: form.type,
        percent: form.type === 'percent' && form.percent ? Number(form.percent) : undefined,
        amount: form.type === 'fixed' && form.amount ? Number(form.amount) : undefined,
        freeShipping: form.freeShipping,
        active: form.active,
        endsAt: form.endsAt || undefined,
        minOrderTotal: form.minOrderTotal ? Number(form.minOrderTotal) : undefined,
        maxUses: form.maxUses ? Number(form.maxUses) : undefined,
      };
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Chyba pri vytváraní kupónu');
        return;
      }
      setForm(EMPTY_FORM);
      setShowForm(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{coupons.length} kupón{coupons.length === 1 ? '' : coupons.length < 5 ? 'y' : 'ov'}</p>
        <button
          onClick={() => { setShowForm(v => !v); setError(null); }}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors"
        >
          {showForm ? 'Zrušiť' : '+ Nový kupón'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6 space-y-4">
          <h3 className="text-base font-semibold text-white">Nový kupón</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs text-slate-400">Kód kupónu *</label>
              <input
                required
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="napr. LETO25"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Popis (voliteľný)</label>
              <input
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Letná akcia..."
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Typ zľavy *</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as 'percent' | 'fixed' }))}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="percent">Percentuálna (%)</option>
                <option value="fixed">Pevná suma (€)</option>
              </select>
            </div>
            {form.type === 'percent' ? (
              <div>
                <label className="text-xs text-slate-400">Zľava (%)</label>
                <input
                  required
                  type="number"
                  min="1"
                  max="100"
                  value={form.percent}
                  onChange={e => setForm(f => ({ ...f, percent: e.target.value }))}
                  placeholder="10"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            ) : (
              <div>
                <label className="text-xs text-slate-400">Suma (€)</label>
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="5.00"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            )}
            <div>
              <label className="text-xs text-slate-400">Platí do (voliteľné)</label>
              <input
                type="date"
                value={form.endsAt}
                onChange={e => setForm(f => ({ ...f, endsAt: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Min. hodnota objednávky (€)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.minOrderTotal}
                onChange={e => setForm(f => ({ ...f, minOrderTotal: e.target.value }))}
                placeholder="—"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Max. použití (voliteľné)</label>
              <input
                type="number"
                min="1"
                value={form.maxUses}
                onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
                placeholder="—"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-4 pt-5">
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.freeShipping}
                  onChange={e => setForm(f => ({ ...f, freeShipping: e.target.checked }))}
                  className="accent-emerald-500"
                />
                Doprava zadarmo
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                  className="accent-emerald-500"
                />
                Aktívny
              </label>
            </div>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Ukladám...' : 'Vytvoriť kupón'}
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/60">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">Kód</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">Typ / Hodnota</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">Použití</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">Platí do</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">Stav</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">Akcia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {coupons.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">Žiadne kupóny</td>
              </tr>
            )}
            {coupons.map(c => (
              <tr key={c.id} className="bg-slate-950/40 hover:bg-slate-900/60 transition-colors">
                <td className="px-4 py-3">
                  <span className="font-mono font-semibold text-emerald-300">{c.code}</span>
                  {c.description && <p className="text-xs text-slate-500 mt-0.5">{c.description}</p>}
                  {c.freeShipping && <span className="text-xs text-sky-400">+ doprava zadarmo</span>}
                </td>
                <td className="px-4 py-3 text-slate-200">
                  {c.type === 'percent' ? `${c.percent}%` : `${Number(c.amount).toFixed(2)} €`}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ''}
                </td>
                <td className="px-4 py-3 text-slate-400">{formatDate(c.endsAt)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${c.active ? 'bg-emerald-900/50 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                    {c.active ? 'Aktívny' : 'Neaktívny'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggle(c)}
                    disabled={toggling === c.id}
                    className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${c.active ? 'bg-slate-800 text-slate-300 hover:bg-red-900/40 hover:text-red-300' : 'bg-slate-800 text-slate-300 hover:bg-emerald-900/40 hover:text-emerald-300'}`}
                  >
                    {toggling === c.id ? '...' : c.active ? 'Deaktivovať' : 'Aktivovať'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
