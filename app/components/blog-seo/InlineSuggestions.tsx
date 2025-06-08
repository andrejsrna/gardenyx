'use client';

import { useEffect, useState } from 'react';
import { getSuggestionsByTopic } from './InlineContentSuggestions';

interface InlineSuggestionsProps {
  topic: string;
  className?: string;
}

export default function InlineSuggestions({ topic, className = '' }: InlineSuggestionsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mount inline suggestions to the mount point in the article
  useEffect(() => {
    if (!mounted) return;

    const mountPoint = document.getElementById('inline-suggestions-mount-point');
    if (mountPoint) {
      const suggestions = getSuggestionsByTopic(topic);
      
      // Create a simple inline suggestions display
      mountPoint.innerHTML = `
        <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 my-8 border border-green-100">
          <div class="flex items-center gap-2 mb-4">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
            <h3 class="font-bold text-lg text-gray-900">Mohlo by vás zaujímať</h3>
          </div>
          <div class="space-y-3">
            ${suggestions.map(suggestion => `
              <a href="${suggestion.href}" class="block p-4 rounded-lg border transition-all duration-200 hover:shadow-md bg-green-50 border-green-200 text-green-800">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span class="text-xl">${getIconForType(suggestion.type)}</span>
                    <div>
                      <h4 class="font-medium text-sm">${suggestion.title}</h4>
                      <p class="text-xs opacity-75 mt-1">${suggestion.description}</p>
                    </div>
                  </div>
                  <svg class="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }
  }, [mounted, topic]);

  if (!mounted) return null;

  return (
    <div className={className}>
      {/* This component injects inline suggestions into the article content */}
    </div>
  );
}

function getIconForType(type: string): string {
  const icons = {
    ingredient: '🌿',
    product: '🛒',
    blog: '📖',
    guide: '📋'
  };
  return icons[type as keyof typeof icons] || '📄';
} 