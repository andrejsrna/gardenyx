'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export default function RegistraciaPage() {
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
    setEmailError(ok ? null : 'Zadajte platný email');
    return ok;
  };

  const validatePassword = (value: string) => {
    if (value.length < 8) {
      setPasswordError('Heslo musí mať aspoň 8 znakov');
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
        body: JSON.stringify({ email, password, firstName, lastName, consent, newsletter })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registrácia zlyhala');
      }
      setSuccess(true);
      toast.success('Registrácia úspešná. Skontrolujte email pre overenie.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registrácia zlyhala';
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
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Registrácia úspešná</h1>
          <p className="text-gray-600">Na <strong>{email}</strong> sme poslali overovací email. Dokončite registráciu kliknutím na link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-sm p-6 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Vytvoriť účet</h1>
        <p className="text-gray-600 mb-4">Zaregistrujte sa a overte svoj email.</p>

        {error && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meno</label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priezvisko</label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
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
              <p className="mt-1 text-xs text-gray-500">Použite email, ktorý ste použili pri objednávkach.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heslo</label>
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
              {passwordError || 'Min. 8 znakov, odporúčame kombináciu písmen a číslic.'}
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
              Súhlasím so spracovaním osobných údajov a obchodnými podmienkami.
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
              Chcem dostávať newsletter s novinkami a zľavami.
            </label>
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !!emailError || !!passwordError || !consent}
            className="w-full rounded-lg bg-green-600 px-4 py-2 text-white font-semibold hover:bg-green-700 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Registrujem...' : 'Registrovať'}
          </button>
        </form>
      </div>
    </div>
  );
}
