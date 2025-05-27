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

  const handleScroll = (event: MouseEvent<HTMLAnchorElement>, targetId: string) => {
    event.preventDefault();
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = targetElement.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Close the accordion after clicking a link
      setIsOpen(false);
    }
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
                  onClick={(e) => handleScroll(e, heading.id)}
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
