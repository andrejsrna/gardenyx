// This file configures the initialization of Sentry on the client using the Next.js Client Instrumentation Hook.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
// https://nextjs.org/docs/app/api-reference/config/next-config-js/clientInstrumentationHook

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://5214c5d315c9ebaf36a9ce90258d6a71@o4509008991879168.ingest.de.sentry.io/4509008997384272",

  // Temporarily disable integrations/features to check bundle size impact
  // integrations: [
  //   Sentry.replayIntegration(),
  // ],

  // Disable performance monitoring
  tracesSampleRate: 0,

  // Disable replay sampling (as integration is disabled)
  // replaysSessionSampleRate: 0,
  // replaysOnErrorSampleRate: 0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
