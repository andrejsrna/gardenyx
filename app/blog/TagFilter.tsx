'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { WordPressTag } from '../lib/wordpress';

interface TagFilterProps {
  allTags: WordPressTag[];
  selectedTagSlug?: string;
  searchQuery?: string;
}

const INITIAL_TAGS_COUNT = 8;

export default function TagFilter({ allTags, selectedTagSlug, searchQuery }: TagFilterProps) {
  const router = useRouter();
  const [showAllTags, setShowAllTags] = useState(false);
  
  if (!allTags.length) return null;

  const visibleTags = showAllTags ? allTags : allTags.slice(0, INITIAL_TAGS_COUNT);
  const hasMoreTags = allTags.length > INITIAL_TAGS_COUNT;

  const handleTagClick = (tagSlug?: string) => {
    const params = new URLSearchParams();
    if (tagSlug) params.set('tag', tagSlug);
    if (searchQuery) params.set('search', searchQuery);
    
    const queryString = params.toString();
    const url = queryString ? `/blog?${queryString}` : '/blog';
    router.push(url);
  };

  const TagButton = ({ tag, isSelected }: { tag: WordPressTag; isSelected: boolean }) => (
    <button
      key={tag.id}
      onClick={() => handleTagClick(isSelected ? undefined : tag.slug)}
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
        isSelected
          ? 'bg-green-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {tag.name}
      <span className={`ml-1.5 text-xs ${isSelected ? 'text-green-200' : 'text-gray-500'}`}>
        ({tag.count})
      </span>
    </button>
  );

  const ToggleButton = () => (
    <button
      onClick={() => setShowAllTags(!showAllTags)}
      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
    >
      {showAllTags ? (
        <>
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          Menej
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          Viac tém ({allTags.length - INITIAL_TAGS_COUNT})
        </>
      )}
    </button>
  );

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Témy:</h3>
        {selectedTagSlug && (
          <button
            onClick={() => handleTagClick()}
            className="text-sm text-gray-500 hover:text-gray-700 underline cursor-pointer"
          >
            Zrušiť filter
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {visibleTags.map(tag => (
          <TagButton 
            key={tag.id}
            tag={tag} 
            isSelected={selectedTagSlug === tag.slug} 
          />
        ))}
        
        {hasMoreTags && <ToggleButton />}
      </div>
    </div>
  );
}