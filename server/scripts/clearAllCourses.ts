require('dotenv').config();
import mongoose from "mongoose";
import CourseModel from "../models/course.model";
import { redis } from "../utils/redis";

const clearAllCourses = async () => {
    try {
        const dbUrl = process.env.MONGO_URI || "";
        await mongoose.connect(dbUrl);
        console.log("Database connected");

        // Delete all courses
        const result = await CourseModel.deleteMany({});
        console.log(`Deleted ${result.deletedCount} courses from the database.`);

        // Clear Redis cache
        console.log("Clearing Redis cache...");
        await redis.del("allCourses");
        await redis.del("Categories");
        console.log("Redis cache cleared.");

    } catch (error) {
        console.error("Error clearing courses:", error);
    } finally {
        await mongoose.disconnect();
        await redis.quit();
        console.log("Database and Redis disconnected");
    }
};

clearAllCourses();
