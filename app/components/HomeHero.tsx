import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '../../i18n/navigation';

export default async function HomeHero({ locale }: { locale: string }) {
  setRequestLocale(locale);
  const t = await getTranslations('hero');

  return (
    <section
      className="relative min-h-[90vh] flex items-center overflow-hidden"
      style={{ backgroundImage: 'url(/hnojiva.webp)', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-24 max-w-3xl">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
          {t('heading')}
        </h1>
        <p className="text-lg sm:text-xl text-white/85 mb-10 max-w-xl">
          {t('subheading')}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/kupit"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-900/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-400"
          >
            {t('cta')}
          </Link>
          <Link
            href="/hnojiva-hakofyt"
            className="inline-flex items-center justify-center rounded-full border border-white/70 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-emerald-900"
          >
            {t('hakofytCta')}
          </Link>
        </div>
      </div>
    </section>
  );
}
