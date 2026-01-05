"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = require("ioredis");
const redisClient = () => {
    if (process.env.REDIS_URL) {
        console.log(`Redis connected`);
        return process.env.REDIS_URL;
    }
    // Fallback logic intended to prevent immediate startup crash.
    // In production without Redis, auth will fail, but the server will respond.
    console.warn("REDIS_URL not provided. Auth features will fail.");
    return process.env.REDIS_URL || "redis://localhost:6379";
};
exports.redis = new ioredis_1.Redis(redisClient());
// Handle connection errors to prevent unhandled exceptions crashing the server
exports.redis.on('error', (err) => {
    // Suppress connectivity errors to keep server alive if Redis is down
    console.error('Redis connection error (non-fatal):', err.message);
});
