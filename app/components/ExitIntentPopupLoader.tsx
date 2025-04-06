'use client';

import dynamic from 'next/dynamic';

// Dynamically import the actual ExitIntentPopup, disabling SSR
const DynamicExitIntentPopup = dynamic(
  () => import('./ExitIntentPopup'),
  { ssr: false }
);

export default function ExitIntentPopupLoader() {
  // Render the dynamically loaded component
  return <DynamicExitIntentPopup />;
}
