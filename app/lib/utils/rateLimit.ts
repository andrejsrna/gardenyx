import { LRUCache } from 'lru-cache';

interface RateLimitConfig {
  max: number;
  windowMs: number;
}

const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  default: {
    max: 100,    // 100 requests
    windowMs: 60000 // per minute
  },
  payment: {
    max: 5,      // 5 requests
    windowMs: 900000 // per 15 minutes
  },
  auth: {
    max: 5,      // 5 attempts
    windowMs: 900000 // per 15 minutes
  }
};

const rateLimiters = new Map<string, LRUCache<string, number>>();

// Initialize rate limiters
Object.entries(RATE_LIMIT_CONFIGS).forEach(([key, config]) => {
  rateLimiters.set(key, new LRUCache({
    max: 10000,
    ttl: config.windowMs
  }));
});

export async function rateLimit(ip: string, type: keyof typeof RATE_LIMIT_CONFIGS = 'default') {
  const limiter = rateLimiters.get(type);
  const config = RATE_LIMIT_CONFIGS[type];
  
  if (!limiter || !config) {
    throw new Error('Invalid rate limiter configuration');
  }

  const attempts = limiter.get(ip) || 0;
  
  if (attempts >= config.max) {
    throw new Error(`rate limit exceeded for ${type}`);
  }
  
  limiter.set(ip, attempts + 1);
} 