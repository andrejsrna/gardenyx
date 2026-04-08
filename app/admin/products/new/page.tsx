import Link from 'next/link';

import { createProductAction } from '../actions';
import SubmitButton from '../SubmitButton';
import VariantsEditor from '../VariantsEditor';
import DocumentsEditor from '../DocumentsEditor';
import ImageUpload from '../ImageUpload';

export const dynamic = 'force-dynamic';

const CATEGORY_OPTIONS = [
  { id: 1, slug: 'hnojiva-hakofyt-b', name: 'Hnojiva Hakofyt B' },
  { id: 4, slug: 'hnojiva-hakofyt-plus', name: 'Hnojiva Hakofyt Plus' },
  { id: 3, slug: 'hnojiva-hakofyt-max', name: 'Hnojiva Hakofyt Max' },
  { id: 2, slug: 'herbicidy', name: 'Herbicidy' },
  { id: 5, slug: 'insekticidy', name: 'Insekticidy' },
];

export default function AdminNewProductPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/admin/products" className="text-sm text-emerald-300 hover:text-emerald-200">
              ← Späť na produkty
            </Link>
            <h1 className="mt-3 text-2xl font-semibold text-white">Nový produkt</h1>
            <p className="mt-1 text-sm text-slate-400">Vyplň povinné polia (Názov, Slug) a ulož.</p>
          </div>
        </div>
      </div>

      <form action={createProductAction} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-6">

            {/* Slovak */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
              <h2 className="text-lg font-semibold text-white">🇸🇰 Slovenčina</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-200">Názov <span className="text-red-400">*</span></span>
                  <input name="name" required placeholder="napr. Hakofyt B 5L"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Cena (€)</span>
                  <input name="price" type="number" step="0.01" placeholder="0.00"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Regular cena (€)</span>
                  <input name="regularPrice" type="number" step="0.01" placeholder="0.00"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Akciová cena (€)</span>
                  <input name="salePrice" type="number" step="0.01" placeholder=""
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">SKU</span>
                  <input name="sku" placeholder="napr. HKF-B-5L"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-200">Krátky popis</span>
                  <textarea name="shortDescription" rows={3}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-200">Popis (Markdown)</span>
                  <textarea name="description" rows={14}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-sm text-white focus:border-emerald-500 focus:outline-none" />
                </label>
              </div>
            </section>

            {/* English */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
              <h2 className="text-lg font-semibold text-white">🇬🇧 English</h2>
              <div className="mt-5 grid gap-4">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Name</span>
                  <input name="translations.en.name"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Short description</span>
                  <textarea name="translations.en.shortDescription" rows={3}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Description (Markdown)</span>
                  <textarea name="translations.en.description" rows={12}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-sm text-white focus:border-emerald-500 focus:outline-none" />
                </label>
              </div>
            </section>

            {/* Hungarian */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
              <h2 className="text-lg font-semibold text-white">🇭🇺 Magyar</h2>
              <div className="mt-5 grid gap-4">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Név</span>
                  <input name="translations.hu.name"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Rövid leírás</span>
                  <textarea name="translations.hu.shortDescription" rows={3}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Leírás (Markdown)</span>
                  <textarea name="translations.hu.description" rows={12}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-sm text-white focus:border-emerald-500 focus:outline-none" />
                </label>
              </div>
            </section>

            {/* Variants */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
              <h2 className="text-lg font-semibold text-white">Varianty (1L / 5L / ...)</h2>
              <p className="mt-1 text-sm text-slate-400">Pri type &quot;variable&quot; pridaj varianty s rôznymi veľkosťami a cenami.</p>
              <div className="mt-5">
                <VariantsEditor initial={[]} />
              </div>
            </section>

            {/* Documents */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
              <h2 className="text-lg font-semibold text-white">Dokumenty (bezpečnostné listy, ...)</h2>
              <p className="mt-1 text-sm text-slate-400">PDF súbory zobrazené na stránke produktu.</p>
              <div className="mt-5">
                <DocumentsEditor initial={[]} />
              </div>
            </section>

          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-6">

            {/* Identifikácia */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
              <h2 className="text-lg font-semibold text-white">Identifikácia</h2>
              <div className="mt-5 grid gap-4">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">
                    Slug <span className="text-red-400">*</span>
                  </span>
                  <input name="slug" required pattern="[a-z0-9\-]+" placeholder="napr. hakofyt-b-5l"
                    title="Len malé písmená, číslice a pomlčky"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-sm text-white focus:border-emerald-500 focus:outline-none" />
                  <p className="text-xs text-slate-400">Len malé písmená, číslice a pomlčky. Bude súčasťou URL.</p>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">wcId</span>
                  <input name="wcId" type="number" placeholder="Nechaj prázdne = auto"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                  <p className="text-xs text-slate-400">Nechaj prázdne — systém vygeneruje automaticky.</p>
                </label>
              </div>
            </section>

            {/* Metadata */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
              <h2 className="text-lg font-semibold text-white">Metadata</h2>
              <div className="mt-5 grid gap-4">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Typ</span>
                  <select name="type" defaultValue="simple"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none">
                    <option value="simple">simple</option>
                    <option value="variable">variable</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Status</span>
                  <select name="status" defaultValue="draft"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none">
                    <option value="draft">draft</option>
                    <option value="publish">publish</option>
                    <option value="pending">pending</option>
                    <option value="private">private</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Stock status</span>
                  <select name="stockStatus" defaultValue="instock"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none">
                    <option value="instock">instock</option>
                    <option value="outofstock">outofstock</option>
                    <option value="onbackorder">onbackorder</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Stock quantity</span>
                  <input name="stockQuantity" type="number"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Hmotnosť (kg)</span>
                  <input name="weight" type="number" step="0.001"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                </label>
              </div>
            </section>

            {/* Categories */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
              <h2 className="text-lg font-semibold text-white">Kategória</h2>
              <div className="mt-4 space-y-3">
                {CATEGORY_OPTIONS.map((cat) => (
                  <label key={cat.slug} className="flex items-start gap-3 rounded-2xl border border-slate-800 px-4 py-3 text-sm text-slate-200">
                    <input type="checkbox" name="categories" value={`${cat.id}|${cat.slug}|${cat.name}`}
                      className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-950 text-emerald-500 focus:ring-emerald-500" />
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* Image upload */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
              <h2 className="text-lg font-semibold text-white">Hlavný obrázok</h2>
              <div className="mt-5">
                <ImageUpload defaultSrc="" defaultAlt="" />
              </div>
            </section>

            {/* Save */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
              <SubmitButton
                idleLabel="Vytvoriť produkt"
                pendingLabel="Vytváram..."
                className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </section>

          </div>
        </div>
      </form>
    </div>
  );
}
