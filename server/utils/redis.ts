import { Redis } from "ioredis";

const redisClient = () => {
    if (process.env.REDIS_URL) {
        console.log(`Redis connected`)
        return process.env.REDIS_URL
    }
    throw new Error('Redis connected failed')
}

export const redis = new Redis(redisClient())