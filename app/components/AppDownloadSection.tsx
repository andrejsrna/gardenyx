import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

export default async function AppDownloadSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'appDownload' });

  return (
    <section className="bg-stone-50 py-12 sm:py-16">
      <div className="container mx-auto px-6 sm:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-[0_20px_80px_-40px_rgba(21,128,61,0.35)]">
          <div className="grid items-center gap-10 bg-gradient-to-br from-white via-emerald-50/60 to-lime-50 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-14 lg:py-14">
            <div className="max-w-2xl">
              <p className="mb-4 flex w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-green-800">
                {t('eyebrow')}
              </p>
              <h2 className="max-w-xl text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
                {t('title')}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
                {t('description')}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white p-1 shadow-sm">
                  <Image
                    src="/images/app-download/app-store-badge.svg"
                    alt={t('badges.appStoreAlt')}
                    width={182}
                    height={54}
                    className="h-auto w-[160px] sm:w-[182px]"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white p-1 shadow-sm">
                  <Image
                    src="/images/app-download/google-play-badge.svg"
                    alt={t('badges.googlePlayAlt')}
                    width={182}
                    height={54}
                    className="h-auto w-[160px] sm:w-[182px]"
                  />
                </div>
              </div>
            </div>

            <div className="mx-auto w-full max-w-sm lg:max-w-md">
              <div className="relative mx-auto aspect-[2/3] overflow-hidden rounded-[2rem] bg-gradient-to-b from-emerald-100 via-white to-lime-100 p-4 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.55)]">
                <div className="absolute inset-x-10 top-4 h-8 rounded-full bg-white/70 blur-2xl" aria-hidden />
                <Image
                  src="/images/app-download/gardenyx-app-mockup.png"
                  alt={t('mockupAlt')}
                  fill
                  sizes="(min-width: 1024px) 32vw, (min-width: 640px) 50vw, 90vw"
                  className="object-contain object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
