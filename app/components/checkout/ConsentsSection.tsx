'use client';

import { ChangeEvent } from 'react';
import { useTranslations } from 'next-intl';
import type { FormData } from '@eshop-core/checkout/types';

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
  onInputChange,
}: ConsentsSectionProps) {
  const t = useTranslations('checkout.consents');
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">{t('title')}</h3>
      
      <div className="space-y-4">
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
              {t('marketing')}
            </span>
          </label>
        </div>
      </div>
      
    </div>
  );
} 
