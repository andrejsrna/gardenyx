'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { WordPressTag } from '@/app/lib/wordpress';

interface TagFilterProps {
  allTags: WordPressTag[];
  selectedTagSlug?: string;
  searchQuery?: string;
}

const INITIAL_TAGS_COUNT = 8;

export default function TagFilter({ allTags, selectedTagSlug, searchQuery }: TagFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAllTags, setShowAllTags] = useState(false);

  const handleTagClick = (tagSlug: string = '') => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (tagSlug && tagSlug !== selectedTagSlug) {
      params.set('tag', tagSlug);
    } else {
      params.delete('tag');
    }

    if (searchQuery) {
        params.set('search', searchQuery);
    } else {
        params.delete('search');
    }
    
    params.delete('page');

    router.push(`/blog?${params.toString()}`);
  };

  const visibleTags = showAllTags ? allTags : allTags.slice(0, INITIAL_TAGS_COUNT);
  const hasMoreTags = allTags.length > INITIAL_TAGS_COUNT;

  const TagButton = ({ tag }: { tag: WordPressTag }) => (
    <button
        onClick={() => handleTagClick(tag.slug)}
        className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
            selectedTagSlug === tag.slug
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-gray-100 text-gray-800 border-transparent hover:bg-green-100 hover:text-green-800'
        }`}
    >
        {tag.name}
    </button>
  );
  
  const ToggleButton = () => (
    <button
      onClick={() => setShowAllTags(!showAllTags)}
      className="text-sm font-medium text-green-600 hover:underline"
    >
      {showAllTags ? 'Zobraziť menej' : 'Zobraziť viac'}
    </button>
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="text-xl font-semibold text-gray-800">Témy</h3>
        {selectedTagSlug && (
          <button
            onClick={() => handleTagClick()}
            className="text-sm font-medium text-green-600 hover:text-green-800 hover:underline"
          >
            Zrušiť filter
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {visibleTags.map(tag => (
          <TagButton key={tag.id} tag={tag} />
        ))}
        
        {hasMoreTags && <ToggleButton />}
      </div>
    </div>
  );
}