require('dotenv').config();
import { redis } from "../utils/redis";

const clearRedis = async () => {
    try {
        console.log("Clearing Redis cache...");
        await redis.flushall();
        console.log("Redis cache cleared successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error clearing Redis cache:", error);
        process.exit(1);
    }
};

clearRedis();
