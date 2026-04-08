'use client';

import { useState } from 'react';

export interface VariantRow {
  id: number;
  name: string;
  sku: string;
  price: string;
  stockStatus: string;
}

export default function VariantsEditor({ initial }: { initial: VariantRow[] }) {
  const [rows, setRows] = useState<VariantRow[]>(
    initial.length > 0
      ? initial
      : [],
  );

  const add = () =>
    setRows((prev) => [
      ...prev,
      { id: Date.now(), name: '', sku: '', price: '', stockStatus: 'instock' },
    ]);

  const remove = (id: number) => setRows((prev) => prev.filter((r) => r.id !== id));

  const update = (id: number, field: keyof VariantRow, value: string) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  return (
    <div className="space-y-3">
      <input type="hidden" name="variantsJson" value={JSON.stringify(rows)} />

      {rows.length === 0 && (
        <p className="text-sm text-slate-400">Zatiaľ žiadne varianty. Klikni "Pridať variant".</p>
      )}

      {rows.map((row, idx) => (
        <div key={row.id} className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Variant #{idx + 1}</span>
            <button
              type="button"
              onClick={() => remove(row.id)}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Odstrániť
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="space-y-1">
              <span className="text-xs text-slate-400">Názov (napr. 1 L)</span>
              <input
                value={row.name}
                onChange={(e) => update(row.id, 'name', e.target.value)}
                placeholder="1 L"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-slate-400">SKU</span>
              <input
                value={row.sku}
                onChange={(e) => update(row.id, 'sku', e.target.value)}
                placeholder="produkt-1l"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-slate-400">Cena (€)</span>
              <input
                type="number"
                step="0.01"
                value={row.price}
                onChange={(e) => update(row.id, 'price', e.target.value)}
                placeholder="4.80"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-slate-400">Sklad</span>
              <select
                value={row.stockStatus}
                onChange={(e) => update(row.id, 'stockStatus', e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="instock">Na sklade</option>
                <option value="outofstock">Vypredané</option>
                <option value="onbackorder">Na objednávku</option>
              </select>
            </label>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="rounded-xl border border-dashed border-emerald-600/50 px-4 py-2 text-sm font-medium text-emerald-400 hover:border-emerald-500 hover:text-emerald-300"
      >
        + Pridať variant
      </button>
    </div>
  );
}
