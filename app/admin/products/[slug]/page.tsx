import Link from 'next/link';
import { notFound } from 'next/navigation';

import prisma from '@/app/lib/prisma';

import { updateProductAction } from '../actions';
import SubmitButton from '../SubmitButton';
import VariantsEditor, { type VariantRow } from '../VariantsEditor';
import DocumentsEditor, { type DocumentRow } from '../DocumentsEditor';
import ImageUpload from '../ImageUpload';

export const dynamic = 'force-dynamic';

const CATEGORY_OPTIONS = [
  { id: 1, slug: 'hnojiva-hakofyt-b', name: 'Hnojiva Hakofyt B' },
  { id: 4, slug: 'hnojiva-hakofyt-plus', name: 'Hnojiva Hakofyt Plus' },
  { id: 3, slug: 'hnojiva-hakofyt-max', name: 'Hnojiva Hakofyt Max' },
  { id: 2, slug: 'herbicidy', name: 'Herbicidy' },
  { id: 5, slug: 'insekticidy', name: 'Insekticidy' },
];

function readArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function readRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export default async function AdminProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;

  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) notFound();

  const categories = readArray<{ id?: number; slug?: string; name?: string }>(product.categories);
  const categorySlugs = new Set(categories.map((c) => c.slug).filter(Boolean));
  const images = readArray<{ src?: string; alt?: string | null }>(product.images);
  const primaryImage = images[0] || {};
  const translations = readRecord(product.translations);
  const en = readRecord(translations.en);
  const hu = readRecord(translations.hu);

  // Variants
  const rawVariants = readArray<Record<string, unknown>>(product.variants);
  const initialVariants: VariantRow[] = rawVariants.map((v, i) => ({
    id: typeof v.id === 'number' ? v.id : -(i + 1),
    name: typeof v.name === 'string' ? v.name : '',
    sku: typeof v.sku === 'string' ? v.sku : '',
    price: typeof v.price === 'number' ? String(v.price) : typeof v.price === 'string' ? v.price : '',
    stockStatus: typeof v.stockStatus === 'string' ? v.stockStatus : 'instock',
  }));

  // Documents
  const rawDocs = readArray<Record<string, unknown>>(product.documents);
  const initialDocs: DocumentRow[] = rawDocs.map((d, i) => ({
    id: typeof d.id === 'number' ? d.id : -(i + 1),
    label: typeof d.label === 'string' ? d.label : 'Bezpečnostný list',
    url: typeof d.url === 'string' ? d.url : '',
    lang: typeof d.lang === 'string' ? d.lang : 'sk',
  }));

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/admin/products" className="text-sm text-emerald-300 hover:text-emerald-200">
                ← Späť na produkty
              </Link>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
                {product.status}
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-semibold text-white">{product.name}</h1>
            <p className="mt-1 text-sm text-slate-300">
              Slug: <span className="font-mono text-slate-200">{product.slug}</span> · wcId: {product.wcId.toString()}
            </p>
          </div>
          <a
            href={`/sk/produkt/${product.slug}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
          >
            Otvoriť detail →
          </a>
        </div>

        {query.saved ? (
          <p className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            ✓ Produkt bol uložený a storefront bol revalidovaný.
          </p>
        ) : null}
      </div>

      <form action={updateProductAction} className="space-y-6">
        <input type="hidden" name="slug" value={product.slug} />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          {/* ── LEFT COLUMN ── */}
          <div className="space-y-6">

            {/* Slovak */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
              <h2 className="text-lg font-semibold text-white">🇸🇰 Slovenčina</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-200">Názov</span>
                  <input name="name" defaultValue={product.name}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Cena (€)</span>
                  <input name="price" type="number" step="0.01" defaultValue={product.price.toString()}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Regular cena (€)</span>
                  <input name="regularPrice" type="number" step="0.01" defaultValue={product.regularPrice.toString()}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Akciová cena (€)</span>
                  <input name="salePrice" type="number" step="0.01" defaultValue={product.salePrice?.toString() || ''}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">SKU</span>
                  <input name="sku" defaultValue={product.sku || ''}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-200">Krátky popis</span>
                  <textarea name="shortDescription" rows={3} defaultValue={product.shortDescription || ''}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-slate-200">Popis (Markdown)</span>
                  <textarea name="description" rows={14} defaultValue={product.description || ''}
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
                  <input name="translations.en.name" defaultValue={typeof en.name === 'string' ? en.name : ''}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Short description</span>
                  <textarea name="translations.en.shortDescription" rows={3} defaultValue={typeof en.shortDescription === 'string' ? en.shortDescription : ''}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Description (Markdown)</span>
                  <textarea name="translations.en.description" rows={12} defaultValue={typeof en.description === 'string' ? en.description : ''}
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
                  <input name="translations.hu.name" defaultValue={typeof hu.name === 'string' ? hu.name : ''}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Rövid leírás</span>
                  <textarea name="translations.hu.shortDescription" rows={3} defaultValue={typeof hu.shortDescription === 'string' ? hu.shortDescription : ''}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Leírás (Markdown)</span>
                  <textarea name="translations.hu.description" rows={12} defaultValue={typeof hu.description === 'string' ? hu.description : ''}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-sm text-white focus:border-emerald-500 focus:outline-none" />
                </label>
              </div>
            </section>

            {/* Variants */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
              <h2 className="text-lg font-semibold text-white">Varianty (1L / 5L / ...)</h2>
              <p className="mt-1 text-sm text-slate-400">Pri type &quot;variable&quot; pridaj varianty s rôznymi veľkosťami a cenami.</p>
              <div className="mt-5">
                <VariantsEditor initial={initialVariants} />
              </div>
            </section>

            {/* Documents */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
              <h2 className="text-lg font-semibold text-white">Dokumenty (bezpečnostné listy, ...)</h2>
              <p className="mt-1 text-sm text-slate-400">PDF súbory zobrazené na stránke produktu — napr. bezpečnostné listy pre chemické prípravky.</p>
              <div className="mt-5">
                <DocumentsEditor initial={initialDocs} />
              </div>
            </section>

          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-6">

            {/* Metadata */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
              <h2 className="text-lg font-semibold text-white">Metadata</h2>
              <div className="mt-5 grid gap-4">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Typ</span>
                  <select name="type" defaultValue={product.type}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none">
                    <option value="simple">simple</option>
                    <option value="variable">variable</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Status</span>
                  <select name="status" defaultValue={product.status}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none">
                    <option value="publish">publish</option>
                    <option value="draft">draft</option>
                    <option value="pending">pending</option>
                    <option value="private">private</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Stock status</span>
                  <select name="stockStatus" defaultValue={product.stockStatus || ''}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none">
                    <option value="">—</option>
                    <option value="instock">instock</option>
                    <option value="outofstock">outofstock</option>
                    <option value="onbackorder">onbackorder</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Stock quantity</span>
                  <input name="stockQuantity" type="number" defaultValue={product.stockQuantity ?? ''}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Hmotnosť (kg)</span>
                  <input name="weight" type="number" step="0.001" defaultValue={product.weight?.toString() || ''}
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
                      defaultChecked={categorySlugs.has(cat.slug)}
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
                <ImageUpload
                  defaultSrc={typeof primaryImage.src === 'string' ? primaryImage.src : ''}
                  defaultAlt={typeof primaryImage.alt === 'string' ? primaryImage.alt : ''}
                />
              </div>
            </section>

            {/* Save */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
              <SubmitButton
                idleLabel="Uložiť produkt"
                pendingLabel="Ukladám..."
                className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </section>

          </div>
        </div>
      </form>
    </div>
  );
}
