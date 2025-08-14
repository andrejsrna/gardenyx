'use client';

import { ChangeEvent, useState } from 'react';
import type { FormData } from '../../lib/checkout/types';

interface CreateAccountSectionProps {
  formData: FormData;
  formErrors: Record<string, string[] | undefined> | null;
  onInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    section: 'billing' | 'shipping' | 'consents' | 'root'
  ) => void;
}

export default function CreateAccountSection({
  formData,
  formErrors,
  onInputChange,
}: CreateAccountSectionProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="create_account"
          checked={formData.create_account}
          onChange={(e) => onInputChange(e, 'root')}
          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
        <span className="text-sm font-medium text-gray-700">Vytvoriť zákaznícky účet</span>
      </label>
      
      {formData.create_account && (
        <div className="mt-4">
          <label htmlFor="account_password" className="block text-sm font-medium text-gray-700">
            Heslo <span className="text-red-500">*</span>
          </label>
          <div className="relative mt-1">
            <input
              id="account_password"
              name="account_password"
              type={showPassword ? 'text' : 'password'}
              value={formData.account_password || ''}
              onChange={(e) => onInputChange(e, 'root')}
              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm pr-10 ${
                formErrors?.['account_password'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              required={formData.create_account}
              placeholder="Zadajte heslo k vášmu účtu"
              minLength={8}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? 'Skryť heslo' : 'Zobraziť heslo'}
            >
              {showPassword ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878l4.242 4.242M14.121 14.121L15.536 15.536M9.878 9.878L8.464 8.464M14.121 14.121L15.536 15.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">Heslo musí mať minimálne 8 znakov.</p>
        </div>
      )}
    </div>
  );
} 