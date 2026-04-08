'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

export default function RegistraciaPage() {
  const t = useTranslations('registration');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [consent, setConsent] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validateEmail = (value: string) => {
    const trimmed = value.trim().toLowerCase();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    setEmailError(ok ? null : t('errors.invalidEmail'));
    return ok;
  };

  const validatePassword = (value: string) => {
    if (value.length < 8) {
      setPasswordError(t('errors.passwordTooShort'));
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const emailOk = validateEmail(email);
    const passOk = validatePassword(password);
    if (!emailOk || !passOk) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName, consent, newsletter }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t('errors.failed'));
      }
      setSuccess(true);
      toast.success(t('toasts.success'));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('errors.failed');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{t('success.title')}</h1>
          <p className="text-gray-600">
            {t('success.message', { email })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-sm p-6 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('title')}</h1>
        <p className="text-gray-600 mb-4">{t('subtitle')}</p>

        {error && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('fields.firstName')}</label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('fields.lastName')}</label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('fields.email')}</label>
            <input
              type="email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) validateEmail(e.target.value);
              }}
              onBlur={(e) => validateEmail(e.target.value)}
              required
            />
            {emailError ? (
              <p className="mt-1 text-sm text-rose-600">{emailError}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">{t('hints.email')}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('fields.password')}</label>
            <input
              type="password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) validatePassword(e.target.value);
              }}
              required
              minLength={8}
            />
            <p className={`mt-1 text-sm ${passwordError ? 'text-rose-600' : 'text-gray-500'}`}>
              {passwordError || t('hints.password')}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <input
              id="consent"
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              required
            />
            <label htmlFor="consent" className="text-sm text-gray-700">
              {t('consent')}
            </label>
          </div>
          <div className="flex items-start gap-2">
            <input
              id="newsletter"
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              checked={newsletter}
              onChange={(e) => setNewsletter(e.target.checked)}
            />
            <label htmlFor="newsletter" className="text-sm text-gray-700">
              {t('newsletter')}
            </label>
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !!emailError || !!passwordError || !consent}
            className="w-full rounded-lg bg-green-600 px-4 py-2 text-white font-semibold hover:bg-green-700 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t('submitting') : t('submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
