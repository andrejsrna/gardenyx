'use client';

import { ChangeEvent } from 'react';
import type { FormData } from '../../lib/checkout/types';
import { Link } from '../../../i18n/navigation';

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
        {/* Combined Terms + Privacy */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="termsAndPrivacy"
              checked={formData.consents.termsAndPrivacy}
              onChange={(e) => onInputChange(e, 'consents')}
              className={`mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500 ${
                formErrors?.['consents.termsAndPrivacy'] ? 'border-red-500' : ''
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
              {' '}a{' '}
              <Link 
                href="/ochrana-osobnych-udajov" 
                className="text-green-600 hover:text-green-700 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                zásadami ochrany osobných údajov
              </Link>
              {' '}<span className="text-red-500">*</span>
            </span>
          </label>
          {formErrors?.['consents.termsAndPrivacy'] && (
            <p className="mt-1 text-xs text-red-600">
              Tento súhlas je povinný pre dokončenie objednávky
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
              Súhlasím so zasielaním marketingových ponúk a noviniek e‑mailom (voliteľné)
            </span>
          </label>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600"><span className="text-red-500">*</span> Povinné na dokončenie objednávky</p>
      </div>
    </div>
  );
} 
