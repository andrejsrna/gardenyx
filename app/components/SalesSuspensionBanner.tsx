'use client';

import { isSalesSuspendedClient, getSalesSuspensionMessageClient } from '../lib/utils/sales-suspension';

interface SalesSuspensionBannerProps {
  className?: string;
}

export default function SalesSuspensionBanner({ className = '' }: SalesSuspensionBannerProps) {
  const isSuspended = isSalesSuspendedClient();
  const message = getSalesSuspensionMessageClient();

  if (!isSuspended) {
    return null;
  }

  return (
    <div className={`bg-red-600 text-white py-3 px-4 text-center font-medium ${className}`}>
      <div className="container mx-auto">
        <div className="flex items-center justify-center gap-2">
          <svg 
            className="w-5 h-5 flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
}
