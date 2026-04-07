'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Link2 } from 'lucide-react';

interface CopyLinkButtonProps {
  url: string;
  className?: string;
  label?: string;
}

export default function CopyLinkButton({ url, className = '', label }: CopyLinkButtonProps) {
  const t = useTranslations('copyLinkButton');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Unable to copy link', error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors ${className}`}
      aria-live="polite"
    >
      {copied ? (
        <>
          <Check className="w-5 h-5" />
          <span>{t('copied')}</span>
        </>
      ) : (
        <>
          <Link2 className="w-5 h-5" />
          <span>{label || t('defaultLabel')}</span>
        </>
      )}
    </button>
  );
}
