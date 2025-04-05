export interface RateLimiterOptions {
  interval: number;
  uniqueTokenPerInterval: number;
}

export function rateLimit(options: RateLimiterOptions) {
  const tokenCache = new Map();
  const { interval } = options;

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        // Bypass check in development environment
        if (process.env.NODE_ENV === 'development') {
          resolve();
          return;
        }

        const tokenCount = tokenCache.get(token) || 0;

        if (tokenCount >= limit) {
          reject(new Error('Rate limit exceeded'));
          return;
        }

        tokenCache.set(token, tokenCount + 1);

        setTimeout(() => {
          tokenCache.delete(token);
        }, interval);

        resolve();
      }),
  };
}
