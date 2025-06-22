'use client';

import Link from 'next/link';
import { MouseEvent, useState } from 'react';
import { List, ChevronDown } from 'lucide-react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headings: Heading[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!headings || headings.length === 0) {
    return null;
  }

  const handleLinkClick = (event: MouseEvent<HTMLAnchorElement>, targetId: string) => {
    // We don't prevent default, allowing the browser to navigate to the anchor first.
    
    // We then run a correction check after a delay to account for any layout shifts.
    setTimeout(() => {
      const targetElement = document.getElementById(targetId);
      if (!targetElement) return;

      const headerHeight = 120; // Estimated height of the sticky header in pixels.
      const targetRect = targetElement.getBoundingClientRect();

      // If the element is hidden or partially hidden behind the sticky header...
      if (targetRect.top < headerHeight) {
        // ...scroll again to the correct position.
        const offsetPosition = window.pageYOffset + targetRect.top - headerHeight;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }, 300); // A generous delay to ensure layout is stable.

    // Close the accordion
    setIsOpen(false);
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-green-50/50 transition-colors"
        aria-expanded={isOpen}
      >
        <List className="w-5 h-5 text-green-600" />
        <span className="font-semibold text-gray-900">Obsah článku</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 ml-auto transition-transform duration-300 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      
      <div
        className={`transition-all duration-300 ease-in-out origin-top ${
          isOpen ? 'max-h-[500px] opacity-100 scale-y-100' : 'max-h-0 opacity-0 scale-y-95'
        } overflow-hidden`}
      >
        <nav className="p-4" aria-label="Obsah článku">
          <ul className="space-y-2">
            {headings.map((heading, index) => (
              <li
                key={index}
                className={`pl-${(heading.level - 1) * 4} transition-colors duration-150`}
              >
                <Link
                  href={`#${heading.id}`}
                  onClick={(e) => handleLinkClick(e, heading.id)}
                  className="block py-1.5 px-3 text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-150"
                >
                  {heading.text}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
