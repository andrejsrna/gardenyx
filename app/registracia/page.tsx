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

// Helper component for required field label
const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="flex items-center gap-1">
    {children}
    <span className="text-red-500">*</span>
  </span>
);

// Helper component for validation message
const ValidationMessage = ({ message, isError = false }: { message: string; isError?: boolean }) => (
  <p className={`text-xs mt-1 ${isError ? 'text-red-500' : 'text-gray-500'}`}>
    {message}
  </p>
);

export default function RegistrationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
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

  type FieldValue = string | boolean | { terms: boolean; privacy: boolean; marketing: boolean };

  const validateField = (field: keyof RegistrationData, value: FieldValue) => {
    try {
      if (field === 'consents') {
        registrationSchema.parse({ [field]: value });
      } else {
        registrationSchema.parse({ [field]: value });
      }
      setErrors(prev => ({ ...prev, [field]: '' }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, [field]: error.errors[0].message }));
      }
    }
  };

  const handleInputChange = (field: keyof RegistrationData, value: FieldValue) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

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
      const { isValid, errors: pwdErrors } = validatePassword(formData.password);
      if (!isValid) {
        toast.error('Neplatné heslo', {
          description: pwdErrors.join('\n')
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

      await login(formData.email, formData.password);

      toast.success('Registrácia úspešná', {
        description: 'Boli ste automaticky prihlásený.'
      });
      
      router.push('/moj-ucet');
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.reduce((acc, err) => {
          const field = err.path[0] as string;
          acc[field] = err.message;
          return acc;
        }, {} as Record<string, string>);
        setErrors(validationErrors);
        
        toast.error('Nesprávne vyplnené údaje', {
          description: (
            <ul className="list-disc pl-4 mt-2 space-y-1">
              {error.errors.map((err, index) => (
                <li key={index}>{err.message}</li>
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
                <RequiredLabel>Meno</RequiredLabel>
              </label>
              <input
                type="text"
                id="first_name"
                required
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 ${
                  errors.first_name 
                    ? 'border-red-300' 
                    : formData.first_name 
                      ? 'border-green-300' 
                      : 'border-gray-300'
                }`}
              />
              {errors.first_name && (
                <ValidationMessage message={errors.first_name} isError />
              )}
              <ValidationMessage message="Minimálne 2 znaky" />
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                <RequiredLabel>Priezvisko</RequiredLabel>
              </label>
              <input
                type="text"
                id="last_name"
                required
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 ${
                  errors.last_name 
                    ? 'border-red-300' 
                    : formData.last_name 
                      ? 'border-green-300' 
                      : 'border-gray-300'
                }`}
              />
              {errors.last_name && (
                <ValidationMessage message={errors.last_name} isError />
              )}
              <ValidationMessage message="Minimálne 2 znaky" />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                <RequiredLabel>Email</RequiredLabel>
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 ${
                  errors.email 
                    ? 'border-red-300' 
                    : formData.email 
                      ? 'border-green-300' 
                      : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <ValidationMessage message={errors.email} isError />
              )}
              <ValidationMessage message="Platná emailová adresa" />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                <RequiredLabel>Heslo</RequiredLabel>
              </label>
              <input
                type="password"
                id="password"
                required
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 ${
                  errors.password 
                    ? 'border-red-300' 
                    : formData.password 
                      ? 'border-green-300' 
                      : 'border-gray-300'
                }`}
              />
              {errors.password && (
                <ValidationMessage message={errors.password} isError />
              )}
              <ValidationMessage message="Minimálne 8 znakov, 1 veľké písmeno, 1 číslo a 1 špeciálny znak" />
            </div>

            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                <RequiredLabel>Potvrdiť heslo</RequiredLabel>
              </label>
              <input
                type="password"
                id="confirm_password"
                required
                value={formData.confirm_password}
                onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 ${
                  errors.confirm_password 
                    ? 'border-red-300' 
                    : formData.confirm_password 
                      ? 'border-green-300' 
                      : 'border-gray-300'
                }`}
              />
              {errors.confirm_password && (
                <ValidationMessage message={errors.confirm_password} isError />
              )}
              <ValidationMessage message="Musí sa zhodovať s heslom" />
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  checked={formData.consents.terms}
                  onChange={(e) => handleInputChange('consents', {
                    ...formData.consents,
                    terms: e.target.checked
                  })}
                  className={`mt-1 rounded focus:ring-green-500 ${
                    errors.terms 
                      ? 'border-red-300 text-red-600' 
                      : 'border-gray-300 text-green-600'
                  }`}
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  <RequiredLabel>
                    Súhlasím s <Link href="/obchodne-podmienky" className="text-green-600 hover:underline">obchodnými podmienkami</Link>
                  </RequiredLabel>
                </label>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="privacy"
                  required
                  checked={formData.consents.privacy}
                  onChange={(e) => handleInputChange('consents', {
                    ...formData.consents,
                    privacy: e.target.checked
                  })}
                  className={`mt-1 rounded focus:ring-green-500 ${
                    errors.privacy 
                      ? 'border-red-300 text-red-600' 
                      : 'border-gray-300 text-green-600'
                  }`}
                />
                <label htmlFor="privacy" className="ml-2 block text-sm text-gray-700">
                  <RequiredLabel>
                    Súhlasím so <Link href="/ochrana-osobnych-udajov" className="text-green-600 hover:underline">spracovaním osobných údajov</Link>
                  </RequiredLabel>
                </label>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="marketing"
                  checked={formData.consents.marketing}
                  onChange={(e) => handleInputChange('consents', {
                    ...formData.consents,
                    marketing: e.target.checked
                  })}
                  className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="marketing" className="ml-2 block text-sm text-gray-700">
                  Chcem dostávať informácie o novinkách a zľavách
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || Object.keys(errors).length > 0}
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