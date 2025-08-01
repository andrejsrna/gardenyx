'use client';

import { useEffect } from 'react';
import { tracking } from '../lib/tracking';

interface LeadTrackingProps {
  formName: string;
  value?: number;
  children: React.ReactNode;
  className?: string;
}

export default function LeadTracking({ formName, value, children, className }: LeadTrackingProps) {
  useEffect(() => {
    tracking.lead(formName, value);
  }, [formName, value]);

  return (
    <div onClick={() => {
      tracking.lead(formName, value);
    }} className={className}>
      {children}
    </div>
  );
} 