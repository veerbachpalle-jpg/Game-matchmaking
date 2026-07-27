import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUri = process.env.REDIS_URI || 'redis://localhost:6379';

let useInMemoryRedis = false;
let redisInstance;

try {
  redisInstance = new Redis(redisUri, {
    maxRetriesPerRequest: 1,
    showFriendlyErrorStack: true,
    retryStrategy(times) {
      if (times > 1) {
        useInMemoryRedis = true;
        console.log(
          '⚠️  Redis connection failed. Switching to IN-MEMORY Redis emulation.'
        );
        return null; // Stop retrying
      }
      return 50; // Try once more after 50ms
    },
  });
} catch (err) {
  useInMemoryRedis = true;
  redisInstance = {};
}

class InMemoryRedis {
  constructor() {
    this.hashes = new Map();
    this.zsets = new Map();
  }

  async hset(key, values) {
    const fields = typeof values === 'object' ? values : {};
    this.hashes.set(key, fields);
  }

  async hgetall(key) {
    return this.hashes.get(key) || {};
  }

  async zadd(key, score, member) {
    if (!this.zsets.has(key)) {
      this.zsets.set(key, new Map());
    }
    this.zsets.get(key).set(member, score);
  }

  async zrem(key, member) {
    if (this.zsets.has(key)) {
      this.zsets.get(key).delete(member);
    }
  }

  async zrange(key, start, stop) {
    const zset = this.zsets.get(key);
    if (!zset) return [];

    const entries = Array.from(zset.entries()).sort((a, b) => a[1] - b[1]);

    // Respect start/stop like Redis
    const end = stop === -1 ? undefined : stop + 1;
    return entries.slice(start, end).map((e) => e[0]);
  }

  async del(...keys) {
    keys.forEach((k) => {
      this.hashes.delete(k);
      this.zsets.delete(k);
    });
  }

  multi() {
    const operations = [];
    const self = this;

    return {
      zrem(key, member) {
        operations.push(() => self.zrem(key, member));
        return this;
      },

      del(key) {
        operations.push(() => self.del(key));
        return this;
      },

      async exec() {
        for (const op of operations) {
          await op();
        }
      },
    };
  }

  async keys(pattern) {
    const cleanPattern = pattern.replace('*', '.*');
    const regex = new RegExp(`^${cleanPattern}$`);

    const allKeys = [
      ...this.hashes.keys(),
      ...this.zsets.keys(),
    ];

    return allKeys.filter((k) => regex.test(k));
  }

  on(event, cb) {
    // No-op
  }

  disconnect() {
    // No-op
  }
}

const mockRedis = new InMemoryRedis();

export const redis = new Proxy(
  {},
  {
    get(target, prop) {
      if (
        useInMemoryRedis ||
        !redisInstance ||
        typeof redisInstance.on !== 'function'
      ) {
        return mockRedis[prop];
      }

      return redisInstance[prop];
    },
  }
);

if (redisInstance && typeof redisInstance.on === 'function') {
  redisInstance.on('connect', () => {
    console.log('Connected to Redis successfully');
  });

  redisInstance.on('error', (err) => {
    if (!useInMemoryRedis) {
      console.error('Redis connection error:', err.message || err);
      useInMemoryRedis = true;
      console.log('⚠️  Redis failed. Swapped to IN-MEMORY Redis emulation.');
    }
  });
}