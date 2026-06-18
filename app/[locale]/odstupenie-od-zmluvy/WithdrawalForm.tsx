'use client';

import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '../../../i18n/navigation';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function WithdrawalForm() {
  const t = useTranslations('withdrawalPage');
  const [meno, setMeno] = useState('');
  const [cisloObjednavky, setCisloObjednavky] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [confirmedAt, setConfirmedAt] = useState<{ dateStr: string; timeStr: string } | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'loading') return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/odstupenie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meno, cisloObjednavky, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || t('form.errorGeneric'));
        return;
      }

      setStatus('success');
      setConfirmedAt({ dateStr: data.dateStr, timeStr: data.timeStr });
    } catch {
      setStatus('error');
      setMessage(t('form.errorGeneric'));
    }
  };

  return (
    <main className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link href="/" className="text-green-700 hover:text-green-800 text-sm">
              ← {t('backLink')}
            </Link>
          </div>

          <h1 className="text-4xl font-bold mb-4 text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">{t('description')}</p>

          {status === 'success' && confirmedAt ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-8 w-8 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('form.successTitle')}</h2>
              <p className="text-gray-700 mb-4">{t('form.successMessage')}</p>
              <div className="inline-block rounded-xl bg-white border border-green-200 px-6 py-4 text-left">
                <p className="text-sm text-gray-500 mb-1">{t('form.confirmedAt')}</p>
                <p className="font-bold text-gray-900 text-lg">{confirmedAt.dateStr} o {confirmedAt.timeStr}</p>
              </div>
              <p className="mt-6 text-sm text-gray-600">{t('form.successNote')}</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-green-100 bg-white p-8 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="meno" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('form.name')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="meno"
                    type="text"
                    required
                    value={meno}
                    onChange={(e) => setMeno(e.target.value)}
                    placeholder={t('form.namePlaceholder')}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                </div>

                <div>
                  <label htmlFor="cisloObjednavky" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('form.orderNumber')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="cisloObjednavky"
                    type="text"
                    required
                    value={cisloObjednavky}
                    onChange={(e) => setCisloObjednavky(e.target.value)}
                    placeholder={t('form.orderNumberPlaceholder')}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                  <p className="mt-1 text-xs text-gray-500">{t('form.orderNumberHint')}</p>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('form.email')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('form.emailPlaceholder')}
                    autoComplete="email"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                </div>

                {status === 'error' && (
                  <p className="text-sm text-red-600">{message}</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-200 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status === 'loading' ? t('form.submitting') : t('form.submit')}
                </button>

                <p className="text-xs text-gray-500 text-center">{t('form.submitNote')}</p>
              </form>
            </div>
          )}

          <div className="mt-10 rounded-2xl border border-green-100 bg-green-50/60 p-6 text-sm text-gray-600 space-y-2">
            <p className="font-semibold text-gray-800">{t('info.title')}</p>
            <p>{t('info.deadline')}</p>
            <p>{t('info.address')}</p>
            <p>
              {t('info.contact')}{' '}
              <a href="mailto:support@gardenyx.eu" className="text-green-700 hover:underline">
                support@gardenyx.eu
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
