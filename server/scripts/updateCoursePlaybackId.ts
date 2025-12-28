require("dotenv").config();
import mongoose from "mongoose";
import CourseModel from "../models/course.model";

/**
 * Script to update playback ID for a specific course video
 * Usage: npx ts-node server/scripts/updateCoursePlaybackId.ts
 */

const updateCoursePlaybackId = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI as string;
    if (!mongoUri) {
      console.error("MONGO_URI not found in environment variables");
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // Course details
    const assetId = "LgAksKEB42MJJnwp3T8mUGnbMkfDIec8l7So7Sj00C600";
    const playbackId = "zBjaUmd6BO02CwvhKw1yZCNgJOs5UIFdh00jDtK9MO5VY";
    const videoTitle = "course 1";

    // Find the course with this asset ID and title
    const courses = await CourseModel.find({ "courseData.muxAssetId": assetId });
    
    if (courses.length === 0) {
      console.log(`No course found with asset ID: ${assetId}`);
      return;
    }

    let updated = false;
    for (const course of courses) {
      const courseData = course.courseData as any[];
      const videoIndex = courseData.findIndex(
        (item: any) => item.muxAssetId === assetId && 
        (item.title?.toLowerCase().includes("course 1") || item.title === videoTitle)
      );

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
        const courseData = course.courseData as any[];
        courseData.forEach((item: any) => {
          if (item.muxAssetId === assetId) {
            console.log(`    Video: "${item.title}" (Asset: ${item.muxAssetId})`);
          }
        });
      }
    }

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error: any) {
    console.error("Error updating playback ID:", error.message);
    process.exit(1);
  }
};

// Run the script
updateCoursePlaybackId();

