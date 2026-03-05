export type RateLimitOptions = {
  windowMs: number;
  maxRequests: number;
};

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
};

export interface RateLimitProvider {
  check(key: string, options: RateLimitOptions): Promise<RateLimitResult>;
}

type MemoryEntry = {
  count: number;
  resetAt: number;
};

class InMemoryRateLimitProvider implements RateLimitProvider {
  private readonly store = new Map<string, MemoryEntry>();

  async check(key: string, options: RateLimitOptions): Promise<RateLimitResult> {
    const now = Date.now();
    const entry = this.store.get(key);
    if (!entry || now > entry.resetAt) {
      const resetAt = now + options.windowMs;
      this.store.set(key, { count: 1, resetAt });
      return {
        allowed: true,
        limit: options.maxRequests,
        remaining: Math.max(0, options.maxRequests - 1),
        resetAt,
      };
    }

    if (entry.count >= options.maxRequests) {
      return {
        allowed: false,
        limit: options.maxRequests,
        remaining: 0,
        resetAt: entry.resetAt,
      };
    }

    entry.count += 1;
    return {
      allowed: true,
      limit: options.maxRequests,
      remaining: Math.max(0, options.maxRequests - entry.count),
      resetAt: entry.resetAt,
    };
  }
}

class UpstashRateLimitProvider implements RateLimitProvider {
  constructor(
    private readonly restUrl: string,
    private readonly restToken: string,
    private readonly fallback: RateLimitProvider,
  ) {}

  async check(key: string, options: RateLimitOptions): Promise<RateLimitResult> {
    const redisKey = `ratelimit:${key}`;
    try {
      const response = await fetch(`${this.restUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.restToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", redisKey],
          ["PEXPIRE", redisKey, options.windowMs, "NX"],
          ["PTTL", redisKey],
        ]),
      });

      if (!response.ok) {
        throw new Error(`Upstash pipeline failed (${response.status})`);
      }

      const out = await response.json() as Array<{ result?: unknown }>;
      const count = Number(out?.[0]?.result ?? 0);
      const ttlMs = Number(out?.[2]?.result ?? options.windowMs);
      const resetIn = ttlMs > 0 ? ttlMs : options.windowMs;

      return {
        allowed: count <= options.maxRequests,
        limit: options.maxRequests,
        remaining: Math.max(0, options.maxRequests - count),
        resetAt: Date.now() + resetIn,
      };
    } catch {
      // Fail safe: keep lead capture available and apply per-instance throttling.
      return this.fallback.check(key, options);
    }
  }
}

let provider: RateLimitProvider | null = null;

/**
 * Abstraction layer for rate limiting providers.
 * Default is in-memory for local/dev; production can switch to Redis later.
 */
export function getRateLimitProvider(): RateLimitProvider {
  if (provider) return provider;

  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const selected = process.env.RATE_LIMIT_PROVIDER ?? (upstashUrl && upstashToken ? "upstash" : "memory");

  switch (selected) {
    case "upstash":
      if (upstashUrl && upstashToken) {
        provider = new UpstashRateLimitProvider(
          upstashUrl,
          upstashToken,
          new InMemoryRateLimitProvider(),
        );
        return provider;
      }
      provider = new InMemoryRateLimitProvider();
      return provider;
    case "memory":
    default:
      provider = new InMemoryRateLimitProvider();
      return provider;
  }
}

export function setRateLimitProviderForTests(next: RateLimitProvider | null) {
  provider = next;
}
