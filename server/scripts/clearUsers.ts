require('dotenv').config();
import mongoose from "mongoose";
import userModel from "../models/user.model";
import { redis } from "../utils/redis";

const clearUsers = async () => {
    try {
        const dbUrl = process.env.MONGO_URI || "";
        await mongoose.connect(dbUrl);
        console.log("Database connected");

        // Delete all users
        const result = await userModel.deleteMany({});
        console.log(`Deleted ${result.deletedCount} users from the database.`);

        // Clear Redis to remove any cached sessions
        console.log("Clearing Redis cache...");
        await redis.flushall();
        console.log("Redis cache cleared.");

    } catch (error) {
        console.error("Error clearing users:", error);
    } finally {
        await mongoose.disconnect();
        await redis.quit();
        console.log("Database and Redis disconnected");
    }
};

clearUsers();
