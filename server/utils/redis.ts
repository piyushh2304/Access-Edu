import { Redis } from "ioredis";

const redisClient = () => {
    if (process.env.REDIS_URL) {
        console.log(`Redis connected`)
        return process.env.REDIS_URL
    }
    // Fallback logic intended to prevent immediate startup crash.
    // In production without Redis, auth will fail, but the server will respond.
    console.warn("REDIS_URL not provided. Auth features will fail.")
    return process.env.REDIS_URL || "redis://localhost:6379"
}

export const redis = new Redis(redisClient())

// Handle connection errors to prevent unhandled exceptions crashing the server
redis.on('error', (err) => {
    // Suppress connectivity errors to keep server alive if Redis is down
    console.error('Redis connection error (non-fatal):', err.message);
});