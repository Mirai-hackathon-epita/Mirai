import "server-only";
import type { Redis } from "ioredis";

// ─── KV store ───────────────────────────────────────────────────────
// Unified async key/value + list interface. Backed by Redis (the Scalingo
// managed addon) when REDIS_URL is set, otherwise an in-process Map so local
// dev and a single-instance demo work with zero infrastructure.

export interface Kv {
  readonly backend: "redis" | "memory";
  getJSON<T>(key: string): Promise<T | null>;
  setJSON(key: string, value: unknown): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  /** Push to the head of a list (most-recent-first). */
  listUnshift(key: string, value: unknown): Promise<void>;
  /** Read a JSON list, newest first, optionally limited. */
  listRange<T>(key: string, start?: number, stop?: number): Promise<T[]>;
}

class MemoryKv implements Kv {
  readonly backend = "memory" as const;
  private store = new Map<string, string>();
  private lists = new Map<string, string[]>();

  async getJSON<T>(key: string): Promise<T | null> {
    const raw = this.store.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }
  async setJSON(key: string, value: unknown): Promise<void> {
    this.store.set(key, JSON.stringify(value));
  }
  async del(key: string): Promise<void> {
    this.store.delete(key);
    this.lists.delete(key);
  }
  async exists(key: string): Promise<boolean> {
    return this.store.has(key) || this.lists.has(key);
  }
  async listUnshift(key: string, value: unknown): Promise<void> {
    const arr = this.lists.get(key) ?? [];
    arr.unshift(JSON.stringify(value));
    this.lists.set(key, arr);
  }
  async listRange<T>(key: string, start = 0, stop = -1): Promise<T[]> {
    const arr = this.lists.get(key) ?? [];
    const end = stop === -1 ? arr.length : stop + 1;
    return arr.slice(start, end).map((s) => JSON.parse(s) as T);
  }
}

class RedisKv implements Kv {
  readonly backend = "redis" as const;
  constructor(private client: Redis) {}

  async getJSON<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }
  async setJSON(key: string, value: unknown): Promise<void> {
    await this.client.set(key, JSON.stringify(value));
  }
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }
  async listUnshift(key: string, value: unknown): Promise<void> {
    await this.client.lpush(key, JSON.stringify(value));
  }
  async listRange<T>(key: string, start = 0, stop = -1): Promise<T[]> {
    const raw = await this.client.lrange(key, start, stop);
    return raw.map((s) => JSON.parse(s) as T);
  }
}

// Singleton across hot reloads / route invocations.
const globalForKv = globalThis as unknown as { __miraKv?: Kv };

function build(): Kv {
  const url = process.env.REDIS_URL;
  if (url) {
    try {
      // Lazy require keeps ioredis out of the edge/client bundle.
      const IoRedis = require("ioredis") as typeof import("ioredis").default;
      const client = new IoRedis(url, {
        maxRetriesPerRequest: 2,
        lazyConnect: false,
        enableOfflineQueue: true,
      });
      client.on("error", (err: Error) => {
        console.error("[mira] redis error:", err.message);
      });
      console.log("[mira] kv backend: redis");
      return new RedisKv(client);
    } catch (err) {
      console.error(
        "[mira] redis init failed, falling back to memory:",
        (err as Error).message,
      );
    }
  }
  console.log("[mira] kv backend: memory (no REDIS_URL)");
  return new MemoryKv();
}

export function kv(): Kv {
  if (!globalForKv.__miraKv) globalForKv.__miraKv = build();
  return globalForKv.__miraKv;
}
