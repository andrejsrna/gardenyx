import Link from 'next/link';

import prisma from '@/app/lib/prisma';

import { importProductsFromMarkdownAction } from './actions';
import SubmitButton from './SubmitButton';

export const dynamic = 'force-dynamic';

function getCategoryLabel(categories: unknown) {
  if (!Array.isArray(categories) || categories.length === 0) {
    return 'Bez kategorie';
  }

  return categories
    .map((category) => (category && typeof category === 'object' && 'name' in category ? String(category.name) : ''))
    .filter(Boolean)
    .join(', ');
}

function formatPrice(value: number | string) {
  const numericValue = typeof value === 'string' ? Number(value) : value;
  return numericValue.toLocaleString('sk-SK', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  });
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; imported?: string }>;
}) {
  const params = await searchParams;
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">Produkty</h1>
            <p className="mt-1 text-sm text-slate-300">
              Databazovy katalog pre storefront aj admin editaciu.
            </p>
          </div>

          <form action={importProductsFromMarkdownAction}>
            <SubmitButton
              idleLabel="Migrovat z markdownu"
              pendingLabel="Migrujem..."
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </form>
        </div>

        {params.imported ? (
          <p className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            Import dokonceny. Synchronizovanych produktov: {params.imported}
          </p>
        ) : null}
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-0 shadow-xl shadow-emerald-900/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-900/80 text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Produkt</th>
                <th className="px-4 py-3 text-left font-medium">Slug</th>
                <th className="px-4 py-3 text-left font-medium">Kategoria</th>
                <th className="px-4 py-3 text-left font-medium">Cena</th>
                <th className="px-4 py-3 text-left font-medium">Stav</th>
                <th className="px-4 py-3 text-left font-medium">Preklady</th>
                <th className="px-4 py-3 text-right font-medium">Akcia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
              {products.map((product) => {
                const translations = product.translations && typeof product.translations === 'object'
                  ? Object.keys(product.translations as Record<string, unknown>)
                  : [];

                return (
                  <tr key={product.id} className="hover:bg-slate-900/50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{product.name}</div>
                      <div className="text-xs text-slate-400">wcId: {product.wcId.toString()}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">{product.slug}</td>
                    <td className="px-4 py-3 text-slate-300">{getCategoryLabel(product.categories)}</td>
                    <td className="px-4 py-3 text-slate-200">{formatPrice(product.price.toNumber())}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200">
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {translations.length ? translations.join(', ') : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/products/${product.slug}`}
                        className="inline-flex rounded-xl border border-emerald-500/40 px-3 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/10"
                      >
                        Upravit
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-300">
                    Databaza produktov je zatial prazdna. Pouzi tlacidlo hore a naimportuj markdown produkty.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
