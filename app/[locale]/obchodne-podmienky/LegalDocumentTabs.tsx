'use client';

import { useState } from 'react';

type LegalSection = {
  key: 'shop' | 'app';
  tabLabel: string;
  label: string;
  title: string;
  subtitle: string;
  effectiveDate: string;
  bodyHtml: string;
};

export default function LegalDocumentTabs({ sections }: { sections: LegalSection[] }) {
  const [activeSection, setActiveSection] = useState<'shop' | 'app'>('shop');

  const currentSection = sections.find((section) => section.key === activeSection) ?? sections[0];

  return (
    <>
      <div className="border-b border-stone-200 bg-gradient-to-br from-stone-100 via-white to-green-50 px-6 py-10 sm:px-10 sm:py-12">
        <div className="mb-8 inline-flex rounded-full border border-stone-200 bg-white p-1 shadow-sm">
          {sections.map((section) => {
            const isActive = section.key === activeSection;

            return (
              <button
                key={section.key}
                type="button"
                onClick={() => setActiveSection(section.key)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive ? 'bg-emerald-600 text-white shadow-sm' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {section.tabLabel}
              </button>
            );
          })}
        </div>

        <p className="mb-4 flex w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-green-800">
          {currentSection.label}
        </p>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-stone-500">GardenYX</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{currentSection.title}</h1>
        <p className="mt-2 text-base text-stone-600">{currentSection.subtitle}</p>
        <p className="mt-4 text-sm font-medium text-stone-500">{currentSection.effectiveDate}</p>
      </div>

      <div
        className="prose prose-stone max-w-none px-6 py-10 prose-headings:scroll-mt-24 prose-h2:mt-10 prose-h2:text-2xl prose-h2:font-bold prose-h2:text-stone-900 prose-h3:mt-6 prose-h3:text-lg prose-h3:font-semibold prose-h3:text-stone-900 prose-p:text-stone-700 prose-li:text-stone-700 prose-strong:text-stone-900 prose-a:text-green-700 prose-a:no-underline hover:prose-a:text-green-800 sm:px-10 sm:py-12"
        dangerouslySetInnerHTML={{ __html: currentSection.bodyHtml }}
      />
    </>
  );
}
