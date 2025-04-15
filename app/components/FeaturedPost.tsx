'use client'; // Keep client component if interactions are added, otherwise can be server

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface FeaturedPostProps {
  title: string;
  excerpt: string;
  imageUrl?: string; // Optional image URL
  slug: string;      // Slug to build the link
}

const FeaturedPost: React.FC<FeaturedPostProps> = ({ title, excerpt, imageUrl, slug }) => {
  return (
    <section className="mb-16 bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-xl shadow-lg border border-green-100">
      <div className="container mx-auto px-4">
        <div className="md:flex md:items-center md:gap-8">
          {/* Image Section (Optional) */}
          {imageUrl && (
            <div className="md:w-1/3 mb-6 md:mb-0">
              <Link href={`/${slug}`}>
                <div className="relative aspect-video overflow-hidden rounded-lg shadow-md">
                  <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </Link>
            </div>
          )}

          {/* Text Content Section */}
          <div className={imageUrl ? "md:w-2/3" : "w-full"}> {/* Adjust width based on image presence */}
            <h2 className="text-sm font-semibold uppercase text-green-600 mb-2 tracking-wider">Odporúčaný článok</h2>
            <h3 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">
              <Link href={`/${slug}`} className="hover:text-green-700 transition-colors">
                 <span dangerouslySetInnerHTML={{ __html: title }} />
              </Link>
            </h3>
            <div
              className="text-gray-600 mb-4 line-clamp-3" // Limit excerpt lines
              dangerouslySetInnerHTML={{ __html: excerpt }}
            />
            <Link
              href={`/${slug}`}
              className="inline-flex items-center text-green-700 font-medium hover:underline"
            >
              Čítať celý článok <span className="ml-1">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPost;
