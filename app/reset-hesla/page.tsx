'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ResetHeslaPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      setError('Chýba token alebo email pre reset hesla.');
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !email) {
      setError('Chýba token alebo email.');
      return;
    }
    if (password.length < 8) {
      setError('Heslo musí mať aspoň 8 znakov.');
      return;
    }
    if (password !== confirm) {
      setError('Heslá sa nezhodujú.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Reset hesla zlyhal');
      }
      setSuccess(true);
      toast.success('Heslo bolo zmenené');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset hesla zlyhal');
      toast.error('Reset hesla zlyhal');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Reset hesla</h1>
          <p className="text-gray-600">Chýba token alebo email. Skontrolujte link v e-maile.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Heslo zmenené</h1>
          <p className="text-gray-600">Heslo bolo úspešne aktualizované. Môžete sa prihlásiť s novým heslom.</p>
          <Link
            href="/moj-ucet"
            className="mt-4 inline-flex justify-center rounded-lg bg-green-600 px-4 py-2 text-white font-semibold hover:bg-green-700"
          >
            Prejsť na prihlásenie
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-sm p-6 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Reset hesla</h1>
        <p className="text-gray-600 mb-4">Zadajte nové heslo pre účet <strong>{email}</strong>.</p>

        {error && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nové heslo</label>
            <input
              type="password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Potvrdiť heslo</label>
            <input
              type="password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-green-500"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-green-600 px-4 py-2 text-white font-semibold hover:bg-green-700 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Ukladám...' : 'Zmeniť heslo'}
          </button>
        </form>
      </div>
    </div>
  );
}
