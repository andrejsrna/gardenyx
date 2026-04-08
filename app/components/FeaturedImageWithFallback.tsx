'use client';

import Image from 'next/image';
import { useState } from 'react';

interface FeaturedImageWithFallbackProps {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  blurDataURL?: string;
}

export default function FeaturedImageWithFallback({ 
  src, 
  alt, 
  className = "object-cover",
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw',
  blurDataURL
}: FeaturedImageWithFallbackProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const hasError = !src || failedSrc === src;

  if (hasError) {
    const placeholderClasses = [
      'absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-600 via-green-700 to-emerald-800',
      className
    ].filter(Boolean).join(' ');

    return (
      <div className={placeholderClasses}>
        <div className="flex flex-col items-center gap-3 text-white">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm">
            <span className="text-3xl" role="img" aria-label="Placeholder image">
              🌿
            </span>
          </div>
          <p className="text-sm font-medium uppercase tracking-widest text-white/80">
            Najsilnejšia kĺbová výživa
          </p>
        </div>
      </div>
    );
  }

  const handleError = () => setFailedSrc(src);

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      priority={priority}
      fetchPriority={priority ? "high" : undefined}
      placeholder={blurDataURL ? 'blur' : undefined}
      blurDataURL={blurDataURL}
      onError={handleError}
    />
  );
}
