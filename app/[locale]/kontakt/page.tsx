import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type ContactPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contactPage.meta' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'contactPage' });

  return (
    <main className="bg-stone-50 py-12 sm:py-16">
      <div className="container mx-auto px-6 sm:px-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
            <div className="grid gap-8 px-6 py-8 md:grid-cols-[1.2fr_0.8fr] md:px-8 md:py-10">
              <div className="space-y-4">
                <div className="flex w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-green-800">
                  {t('eyebrow')}
                </div>
                <div className="space-y-3">
                  <h1 className="font-serif text-4xl text-stone-900 sm:text-5xl">{t('title')}</h1>
                  <p className="max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
                    {t('description')}
                  </p>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-stone-200 bg-stone-50 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">
                  {t('primaryContact.label')}
                </p>
                <a
                  href="mailto:support@gardenyx.eu"
                  className="mt-4 block text-2xl font-semibold text-stone-900 transition hover:text-green-700"
                >
                  support@gardenyx.eu
                </a>
                <p className="mt-3 text-sm leading-6 text-stone-600">{t('primaryContact.description')}</p>
              </div>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">
                {t('company.label')}
              </p>
              <div className="mt-4 space-y-3 text-stone-700">
                <p className="text-xl font-semibold text-stone-900">{t('company.name')}</p>
                <div className="space-y-1 text-sm leading-6">
                  <p>{t('company.addressLine1')}</p>
                  <p>{t('company.addressLine2')}</p>
                  <p>{t('company.country')}</p>
                </div>
                <p className="text-sm leading-6">
                  <span className="font-medium text-stone-900">{t('company.icoLabel')}:</span> 57 313 504
                </p>
              </div>
            </article>

            <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">
                {t('support.label')}
              </p>
              <div className="mt-4 space-y-4 text-sm leading-6 text-stone-600">
                <p>{t('support.orders')}</p>
                <p>{t('support.app')}</p>
                <p>{t('support.legal')}</p>
              </div>
            </article>
          </section>
        </div>
      </div>
    </main>
  );
}
