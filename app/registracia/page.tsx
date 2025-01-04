'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { registrationSchema, type RegistrationData } from '../lib/validations/registration';
import { validatePassword } from '../lib/utils/password';
import { sanitizeInput } from '../lib/utils/sanitize';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';

export default function RegistrationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegistrationData>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    consents: {
      terms: false,
      privacy: false,
      marketing: false
    }
  });

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);

      // Sanitize inputs
      const sanitizedData = {
        ...formData,
        first_name: sanitizeInput(formData.first_name),
        last_name: sanitizeInput(formData.last_name),
        email: sanitizeInput(formData.email.toLowerCase()),
      };

      // Validate form data
      registrationSchema.parse(sanitizedData);

      // Additional password validation
      const { isValid, errors } = validatePassword(formData.password);
      if (!isValid) {
        toast.error('Neplatné heslo', {
          description: errors.join('\n')
        });
        return;
      }

      // Submit registration
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      // After successful registration, log the user in
      await login(formData.email, formData.password);

      toast.success('Registrácia úspešná', {
        description: 'Boli ste automaticky prihlásený.'
      });
      
      // Redirect to account page instead of login
      router.push('/moj-ucet');
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => err.message);
        toast.error('Nesprávne vyplnené údaje', {
          description: (
            <ul className="list-disc pl-4 mt-2 space-y-1">
              {errors.map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          )
        });
      } else if (error instanceof Error) {
        toast.error('Chyba pri registrácii', {
          description: error.message
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Registrácia
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Už máte účet?{' '}
          <Link href="/prihlasenie" className="text-green-600 hover:text-green-500">
            Prihláste sa
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                Meno
              </label>
              <input
                type="text"
                id="first_name"
                required
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                Priezvisko
              </label>
              <input
                type="text"
                id="last_name"
                required
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Heslo
              </label>
              <input
                type="password"
                id="password"
                required
                pattern="^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$"
                title="Heslo musí obsahovať aspoň 8 znakov, jedno veľké písmeno, číslo a špeciálny znak"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                Potvrdiť heslo
              </label>
              <input
                type="password"
                id="confirm_password"
                required
                value={formData.confirm_password}
                onChange={(e) => setFormData(prev => ({ ...prev, confirm_password: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  checked={formData.consents.terms}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    consents: { ...prev.consents, terms: e.target.checked }
                  }))}
                  className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  Súhlasím s <Link href="/obchodne-podmienky" className="text-green-600 hover:underline">obchodnými podmienkami</Link>
                </label>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="privacy"
                  required
                  checked={formData.consents.privacy}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    consents: { ...prev.consents, privacy: e.target.checked }
                  }))}
                  className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="privacy" className="ml-2 block text-sm text-gray-700">
                  Súhlasím so <Link href="/ochrana-osobnych-udajov" className="text-green-600 hover:underline">spracovaním osobných údajov</Link>
                </label>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="marketing"
                  checked={formData.consents.marketing}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    consents: { ...prev.consents, marketing: e.target.checked }
                  }))}
                  className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="marketing" className="ml-2 block text-sm text-gray-700">
                  Chcem dostávať informácie o novinkách a zľavách
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Registrujem...' : 'Registrovať sa'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 