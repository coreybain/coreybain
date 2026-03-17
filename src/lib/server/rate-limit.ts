type BucketRecord = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  route: string;
  identifier: string;
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
};

declare global {
  var __coreybainesRateLimitStore__: Map<string, BucketRecord> | undefined;
}

function getStore() {
  if (!globalThis.__coreybainesRateLimitStore__) {
    globalThis.__coreybainesRateLimitStore__ = new Map();
  }

  return globalThis.__coreybainesRateLimitStore__;
}

export function checkRateLimit({
  route,
  identifier,
  limit,
  windowMs,
}: RateLimitOptions): RateLimitResult {
  const store = getStore();
  const now = Date.now();
  const key = `${route}:${identifier}`;
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      allowed: true,
      remaining: Math.max(0, limit - 1),
      retryAfterMs: windowMs,
    };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, current.resetAt - now),
    };
  }

  current.count += 1;
  store.set(key, current);

  return {
    allowed: true,
    remaining: Math.max(0, limit - current.count),
    retryAfterMs: Math.max(0, current.resetAt - now),
  };
}
