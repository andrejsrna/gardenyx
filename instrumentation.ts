import * as Sentry from '@sentry/nextjs';

export async function register() {
  const g = globalThis as Record<string, unknown>;
  if (g.File === undefined) {
    g.File = class {};
  }
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
