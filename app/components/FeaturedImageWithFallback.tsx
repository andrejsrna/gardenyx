'use client';

import Image from 'next/image';
import { useState } from 'react';

interface FeaturedImageWithFallbackProps {
  src: string;
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
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-800 flex items-center justify-center">
        <div className="text-white text-6xl">🌿</div>
      </div>
    );
  }

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
      onError={() => setHasError(true)}
    />
  );
}
