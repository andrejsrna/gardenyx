'use client';

import Link from 'next/link';
import { ChangeEvent } from 'react';
import type { FormData } from '../../lib/checkout/types';

interface ConsentsSectionProps {
  formData: FormData;
  formErrors: Record<string, string[] | undefined> | null;
  onInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    section: 'billing' | 'shipping' | 'consents' | 'root'
  ) => void;
}

export default function ConsentsSection({
  formData,
  formErrors,
  onInputChange,
}: ConsentsSectionProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Súhlasy</h3>
      
      <div className="space-y-4">
        {/* Terms and Conditions Consent */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="terms"
              checked={formData.consents.terms}
              onChange={(e) => onInputChange(e, 'consents')}
              className={`mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500 ${
                formErrors?.['consents.terms'] ? 'border-red-500' : ''
              }`}
              required
            />
            <span className="text-sm text-gray-700">
              Súhlasím s{' '}
              <Link 
                href="/obchodne-podmienky" 
                className="text-green-600 hover:text-green-700 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                obchodnými podmienkami
              </Link>
              {' '}<span className="text-red-500">*</span>
            </span>
          </label>
          {formErrors?.['consents.terms'] && (
            <p className="mt-1 text-xs text-red-600">
              Súhlas s obchodnými podmienkami je povinný
            </p>
          )}
        </div>

        {/* Privacy Policy Consent */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="privacy"
              checked={formData.consents.privacy}
              onChange={(e) => onInputChange(e, 'consents')}
              className={`mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500 ${
                formErrors?.['consents.privacy'] ? 'border-red-500' : ''
              }`}
              required
            />
            <span className="text-sm text-gray-700">
              Súhlasím so spracovaním osobných údajov podľa{' '}
              <Link 
                href="/ochrana-osobnych-udajov" 
                className="text-green-600 hover:text-green-700 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                zásad ochrany osobných údajov
              </Link>
              {' '}<span className="text-red-500">*</span>
            </span>
          </label>
          {formErrors?.['consents.privacy'] && (
            <p className="mt-1 text-xs text-red-600">
              Súhlas so spracovaním osobných údajov je povinný
            </p>
          )}
        </div>

        {/* Marketing Consent */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="marketing"
              checked={formData.consents.marketing}
              onChange={(e) => onInputChange(e, 'consents')}
              className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">
              Súhlasím s prijímaním marketingových ponúk a noviniek e-mailom (nepovinné)
            </span>
          </label>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          <span className="text-red-500">*</span> Povinné polia pre dokončenie objednávky
        </p>
      </div>
    </div>
  );
} 