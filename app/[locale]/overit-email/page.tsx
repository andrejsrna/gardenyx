'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Link } from '../../../i18n/navigation';

export default function OveritEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState<string>('Overujem email...');

  useEffect(() => {
    const verify = async () => {
      if (!token || !email) {
        setStatus('error');
        setMessage('Chýba token alebo email.');
        return;
      }
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, email })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Overenie zlyhalo');
        }
        setStatus('success');
        setMessage('Email bol overený. Môžete sa prihlásiť.');
        toast.success('Email overený');
      } catch (err) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Overenie zlyhalo');
        toast.error('Overenie zlyhalo');
      }
    };
    verify();
  }, [token, email]);

  const isSuccess = status === 'success';
  const isError = status === 'error';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-sm p-6 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Overenie emailu</h1>
        <p className={`text-sm ${isSuccess ? 'text-green-700' : isError ? 'text-rose-700' : 'text-gray-700'}`}>
          {message}
        </p>
        {isSuccess && (
          <Link
            href="/moj-ucet"
            className="mt-4 inline-flex justify-center rounded-lg bg-green-600 px-4 py-2 text-white font-semibold hover:bg-green-700"
          >
            Prejsť na prihlásenie
          </Link>
        )}
      </div>
    </div>
  );
}
