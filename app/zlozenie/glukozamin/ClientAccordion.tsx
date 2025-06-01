'use client';

import Accordion from '@/app/components/Accordion';

interface ClientAccordionProps {
  title: string;
  content: string;
}

export default function ClientAccordion({ title, content }: ClientAccordionProps) {
  return <Accordion title={title} content={content} />;
} 