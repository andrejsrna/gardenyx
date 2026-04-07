'use client';

import { ChangeEvent } from 'react';
import { useTranslations } from 'next-intl';
import type { FormData } from '../../lib/checkout/types';
import { HandCoins } from 'lucide-react';

interface PaymentMethodsSectionProps {
  formData: FormData;
  formErrors: Record<string, string[] | undefined> | null;
  onInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    section: 'billing' | 'shipping' | 'consents' | 'root'
  ) => void;
}

export default function PaymentMethodsSection({
  formData,
  formErrors,
  onInputChange,
}: PaymentMethodsSectionProps) {
  const t = useTranslations('checkout.payment');
  const paymentMethods = [
    {
      id: 'stripe',
      title: t('methods.card.title'),
      description: t('methods.card.description'),
      icon: (
        <svg className="w-6 h-6 shrink-0 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
          <path d="M3 10h18" />
          <path d="M7 15h5" />
        </svg>
      ),
      recommended: false,
    },
    {
      id: 'cod',
      title: t('methods.cod.title'),
      description: t('methods.cod.description'),
      icon: <HandCoins className="w-6 h-6 shrink-0 text-gray-600" aria-hidden="true" />,
      recommended: false,
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">{t('title')}</h2>
      
      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <div key={method.id} className="relative">
            <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
              method.recommended 
                ? 'border-green-200 bg-green-50 hover:bg-green-100' 
                : 'hover:bg-gray-50'
            }`}>
              <input
                type="radio"
                name="payment_method"
                value={method.id}
                checked={formData.payment_method === method.id}
                onChange={(e) => onInputChange(e, 'root')}
                className="text-green-600 focus:ring-green-500"
                required
              />
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {method.icon}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{method.title}</span>
                        {method.recommended && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                            {t('recommended')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{method.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </label>
            
            {/* Additional info for specific payment methods */}
            {method.id === 'stripe' && formData.payment_method === 'stripe' && (
              <div className="mt-3 ml-8 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm">
                    <p className="font-medium text-green-800">{t('secureTitle')}</p>
                    <p className="text-green-700">{t('secureDescription')}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Additional info removed for COD - no warning needed */}
          </div>
        ))}
      </div>
      
      {formErrors?.['payment_method'] && (
        <p className="mt-2 text-sm text-red-600">
          {t('validation.selectMethod')}
        </p>
      )}
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>{t('sslNotice')}</span>
        </div>
      </div>
    </div>
  );
} 
