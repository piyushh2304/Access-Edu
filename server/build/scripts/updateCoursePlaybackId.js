"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const mongoose_1 = __importDefault(require("mongoose"));
const course_model_1 = __importDefault(require("../models/course.model"));
/**
 * Script to update playback ID for a specific course video
 * Usage: npx ts-node server/scripts/updateCoursePlaybackId.ts
 */
const updateCoursePlaybackId = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            console.error("MONGO_URI not found in environment variables");
            process.exit(1);
        }
        await mongoose_1.default.connect(mongoUri);
        console.log("Connected to MongoDB");
        // Course details
        const assetId = "LgAksKEB42MJJnwp3T8mUGnbMkfDIec8l7So7Sj00C600";
        const playbackId = "zBjaUmd6BO02CwvhKw1yZCNgJOs5UIFdh00jDtK9MO5VY";
        const videoTitle = "course 1";
        // Find the course with this asset ID and title
        const courses = await course_model_1.default.find({ "courseData.muxAssetId": assetId });
        if (courses.length === 0) {
            console.log(`No course found with asset ID: ${assetId}`);
            return;
        }
        let updated = false;
        for (const course of courses) {
            const courseData = course.courseData;
            const videoIndex = courseData.findIndex((item) => item.muxAssetId === assetId &&
                (item.title?.toLowerCase().includes("course 1") || item.title === videoTitle));
            if (videoIndex !== -1) {
                // Update the playback ID
                courseData[videoIndex].playbackId = playbackId;
                await course.save();
                console.log(`✅ Updated course "${course.name}" - Video "${courseData[videoIndex].title}" with playback ID: ${playbackId}`);
                updated = true;
            }
        }
        if (!updated) {
            console.log(`No video found with asset ID "${assetId}" and title containing "course 1"`);
            console.log("Available courses with this asset ID:");
            for (const course of courses) {
                console.log(`  - Course: ${course.name}`);
                const courseData = course.courseData;
                courseData.forEach((item) => {
                    if (item.muxAssetId === assetId) {
                        console.log(`    Video: "${item.title}" (Asset: ${item.muxAssetId})`);
                    }
                });
            }
        }
        await mongoose_1.default.disconnect();
        console.log("Disconnected from MongoDB");
    }
    catch (error) {
        console.error("Error updating playback ID:", error.message);
        process.exit(1);
    }
};
// Run the script
updateCoursePlaybackId();
