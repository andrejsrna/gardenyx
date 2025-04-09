'use client';

import Link from 'next/link';
import React, { ChangeEvent } from 'react';

// Define a type for the consents part of the form data
interface ConsentsData {
  terms: boolean;
  privacy: boolean;
  marketing: boolean;
}

interface ConsentsProps {
  consentsData: ConsentsData;
  formErrors: Record<string, string[] | undefined> | null;
  onConsentChange: (e: ChangeEvent<HTMLInputElement>, section: 'consents') => void;
}

const Consents: React.FC<ConsentsProps> = ({
  consentsData,
  formErrors,
  onConsentChange,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
      <h2 className="text-xl font-semibold mb-1">Súhlasy</h2>
      <p className="text-xs text-gray-500 mb-3">
        Pre odoslanie objednávky je potrebné súhlasiť s obchodnými podmienkami a spracovaním osobných údajov.
      </p>
      <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
        <input
          type="checkbox"
          id="consents-terms"
          name="terms"
          checked={consentsData.terms}
          onChange={(e) => onConsentChange(e, 'consents')}
          className={`mt-1 flex-shrink-0 rounded border-gray-300 text-green-600 focus:ring-green-500 h-5 w-5 ${formErrors?.['consents.terms'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
          required
        />
        <span className="text-sm text-gray-700">
          Súhlasím s <Link href="/obchodne-podmienky" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">obchodnými podmienkami</Link> <span className="text-red-500 font-medium">*</span>
        </span>
      </label>
      <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
        <input
          type="checkbox"
          id="consents-privacy"
          name="privacy"
          checked={consentsData.privacy}
          onChange={(e) => onConsentChange(e, 'consents')}
          className={`mt-1 flex-shrink-0 rounded border-gray-300 text-green-600 focus:ring-green-500 h-5 w-5 ${formErrors?.['consents.privacy'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
          required
        />
        <span className="text-sm text-gray-700">
          Potvrdzujem, že som sa oboznámil/a s <Link href="/ochrana-osobnych-udajov" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">informáciami o spracúvaní osobných údajov</Link> <span className="text-red-500 font-medium">*</span>
        </span>
      </label>
      <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
        <input
          type="checkbox"
          id="consents-marketing"
          name="marketing"
          checked={consentsData.marketing}
          onChange={(e) => onConsentChange(e, 'consents')}
          className="mt-1 flex-shrink-0 rounded border-gray-300 text-green-600 focus:ring-green-500 h-5 w-5"
        />
        <span className="text-sm text-gray-700">
          Súhlasím so zasielaním marketingových ponúk a noviniek emailom (nepovinné)
        </span>
      </label>
      <p className="text-xs text-gray-500 pt-2">* Povinné polia</p>
    </div>
  );
};

export default Consents;
