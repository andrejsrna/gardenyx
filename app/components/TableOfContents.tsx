'use client';

import Link from 'next/link';
import { MouseEvent } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headings: Heading[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
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
    }
  };

  return (
    <details className="toc-details bg-gray-50 rounded-lg p-4 border border-gray-200 group" open>
      <summary className="cursor-pointer font-semibold text-lg text-gray-800 list-none group-open:mb-3">
        <span className="inline-block transition-transform duration-200 ease-in-out group-open:rotate-90 mr-2">
          ▶
        </span>
        Obsah článku
      </summary>
      <ul className="space-y-2 pl-4">
        {headings.map((heading, index) => (
          <li key={index} className={`toc-level-${heading.level}`}>
            <Link
              href={`#${heading.id}`}
              onClick={(e) => handleScroll(e, heading.id)}
              className="text-green-700 hover:text-green-900 hover:underline transition-colors duration-150 ease-in-out"
            >
              {heading.text}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
