'use client';

import { useActionState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import SubmitButton from '@/app/admin/products/SubmitButton';

type ArticleTranslation = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
};

type ArticleFormData = {
  id?: string;
  slug: string;
  status: string;
  coverImage: string;
  publishedAt: string;
  translations: {
    sk: ArticleTranslation;
    en: ArticleTranslation;
    hu: ArticleTranslation;
  };
};

type Props = {
  initial: ArticleFormData;
  action: (prevState: unknown, formData: FormData) => Promise<unknown>;
  title: string;
};

const LANG_LABELS = {
  sk: { flag: '🇸🇰', name: 'Slovenčina' },
  en: { flag: '🇬🇧', name: 'English' },
  hu: { flag: '🇭🇺', name: 'Magyar' },
} as const;

function LangSection({ locale, t }: { locale: 'sk' | 'en' | 'hu'; t: ArticleTranslation }) {
  const { flag, name } = LANG_LABELS[locale];
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
      <h2 className="text-lg font-semibold text-white">{flag} {name}</h2>
      <div className="mt-5 grid gap-4">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-200">Lokalizovaný slug</span>
          <input
            name={`translations.${locale}.slug`}
            defaultValue={t.slug}
            pattern="[a-z0-9\-]+"
            placeholder={locale === 'sk' ? 'ako-pestovat-paradajky' : locale === 'en' ? 'how-to-grow-tomatoes' : 'hogyan-neveljunk-paradicsomot'}
            title="Len malé písmená, číslice a pomlčky"
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-sm text-white focus:border-emerald-500 focus:outline-none"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-200">
            Nadpis {locale === 'sk' && <span className="text-red-400">*</span>}
          </span>
          <input
            name={`translations.${locale}.title`}
            defaultValue={t.title}
            required={locale === 'sk'}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-200">Perex / výňatok</span>
          <textarea
            name={`translations.${locale}.excerpt`}
            defaultValue={t.excerpt}
            rows={3}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-200">Obsah (Markdown)</span>
          <textarea
            name={`translations.${locale}.content`}
            defaultValue={t.content}
            rows={16}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-sm text-white focus:border-emerald-500 focus:outline-none"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-200">Meta title (SEO)</span>
          <input
            name={`translations.${locale}.metaTitle`}
            defaultValue={t.metaTitle}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-200">Meta description (SEO)</span>
          <textarea
            name={`translations.${locale}.metaDescription`}
            defaultValue={t.metaDescription}
            rows={2}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
          />
        </label>
      </div>
    </section>
  );
}

export default function ArticleForm({ initial, action, title }: Props) {
  const [, formAction] = useActionState(action, null);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
        <Link href="/admin/articles" className="text-sm text-emerald-300 hover:text-emerald-200">
          ← Späť na články
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-white">{title}</h1>
        <p className="mt-1 text-sm text-slate-400">Vyplň slovenský nadpis a slug (povinné). Ostatné jazyky sú voliteľné.</p>
      </div>

      <form action={formAction} className="space-y-6">
        {initial.id && <input type="hidden" name="id" value={initial.id} />}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <div className="space-y-6">
            <LangSection locale="sk" t={initial.translations.sk} />
            <LangSection locale="en" t={initial.translations.en} />
            <LangSection locale="hu" t={initial.translations.hu} />
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
              <h2 className="text-lg font-semibold text-white">Identifikácia</h2>
              <div className="mt-5 grid gap-4">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">
                    Slug <span className="text-red-400">*</span>
                  </span>
                  <input
                    name="slug"
                    required
                    pattern="[a-z0-9\-]+"
                    defaultValue={initial.slug}
                    placeholder="napr. ako-pestovat-paradajky"
                    title="Len malé písmená, číslice a pomlčky"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                  <p className="text-xs text-slate-400">Bude súčasťou URL: /blog/[slug]</p>
                </label>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
              <h2 className="text-lg font-semibold text-white">Publikovanie</h2>
              <div className="mt-5 grid gap-4">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Stav</span>
                  <select
                    name="status"
                    defaultValue={initial.status}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="draft">draft</option>
                    <option value="published">published</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Dátum publikovania</span>
                  <input
                    name="publishedAt"
                    type="datetime-local"
                    defaultValue={initial.publishedAt}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                  <p className="text-xs text-slate-400">Nechaj prázdne = aktuálny čas pri publikovaní.</p>
                </label>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
              <h2 className="text-lg font-semibold text-white">Titulný obrázok</h2>
              <div className="mt-5">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">URL obrázka</span>
                  <input
                    name="coverImage"
                    type="url"
                    defaultValue={initial.coverImage}
                    placeholder="https://..."
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </label>
                {initial.coverImage && (
                  <div className="relative mt-3 h-48 w-full overflow-hidden rounded-2xl">
                    <Image
                      src={initial.coverImage}
                      alt="Cover preview"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
              <SubmitButton
                idleLabel={initial.id ? 'Uložiť zmeny' : 'Vytvoriť článok'}
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
