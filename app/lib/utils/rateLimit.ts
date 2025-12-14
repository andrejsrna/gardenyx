import { LRUCache } from 'lru-cache';

interface RateLimitConfig {
  max: number;
  windowMs: number;
}

const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  default: {
    max: 500,    // 500 requests
    windowMs: 60000 // per minute
  },
  payment: {
    max: 10,     // 10 requests
    windowMs: 900000 // per 15 minutes
  },
  auth: {
    max: 10,     // 10 attempts
    windowMs: 900000 // per 15 minutes
  },
  newsletter: {
    max: 5,      // 5 requests
    windowMs: 900000 // per 15 minutes
  }
};

const rateLimiters = new Map<string, LRUCache<string, number>>();

Object.entries(RATE_LIMIT_CONFIGS).forEach(([key, config]) => {
  rateLimiters.set(key, new LRUCache({
    max: 10000,
    ttl: config.windowMs
  }));
});

export async function getRateLimitStatus(ip: string, type: keyof typeof RATE_LIMIT_CONFIGS = 'default') {
  const limiter = rateLimiters.get(type);
  const config = RATE_LIMIT_CONFIGS[type];

  if (!limiter || !config) {
    return { error: 'Invalid rate limiter configuration' };
  }

  const attempts = limiter.get(ip) || 0;
  const remaining = Math.max(0, config.max - attempts);
  const resetTime = Date.now() + config.windowMs;

  return {
    ip,
    type,
    attempts,
    max: config.max,
    remaining,
    resetTime: new Date(resetTime).toISOString(),
    windowMs: config.windowMs
  };
}

export async function rateLimit(ip: string, type: keyof typeof RATE_LIMIT_CONFIGS = 'default') {
  if (process.env.NODE_ENV === 'development') {
    return;
  }

  const limiter = rateLimiters.get(type);
  const config = RATE_LIMIT_CONFIGS[type];

  if (!limiter || !config) {
    throw new Error('Invalid rate limiter configuration');
  }

  const attempts = limiter.get(ip) || 0;

  if (attempts >= config.max) {
    console.warn(`Rate limit exceeded for IP: ${ip}, type: ${type}, attempts: ${attempts}/${config.max}`);
    throw new Error(`rate limit exceeded for ${type}`);
  }

  limiter.set(ip, attempts + 1);
  
  // Log when approaching rate limit
  if (attempts >= config.max * 0.8) {
    console.warn(`Rate limit warning for IP: ${ip}, type: ${type}, attempts: ${attempts + 1}/${config.max}`);
  }
}
