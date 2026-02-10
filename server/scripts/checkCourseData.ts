require('dotenv').config();
import mongoose from "mongoose";
import CourseModel from "../models/course.model";

const checkCourseData = async () => {
    try {
        const dbUrl = process.env.MONGO_URI || "";
        await mongoose.connect(dbUrl);
        console.log("Database connected");

        const courses = await CourseModel.find({});
        console.log(`Checking ${courses.length} courses...`);

        courses.forEach(course => {
            console.log(`Course: ${course.name} (_id: ${course._id})`);
            if (course.courseData && course.courseData.length > 0) {
                console.log(`  Modules found: ${course.courseData.length}`);
                course.courseData.forEach((item: any, index: number) => {
                    console.log(`    Lesson ${index + 1}: ${item.title}`);
                    console.log(`      muxAssetId: ${item.muxAssetId || 'MISSING'}`);
                    console.log(`      playbackId: ${item.playbackId || 'MISSING'}`);
                });
            } else {
                console.log("  No courseData (modules) found.");
            }
            console.log("-----------------------------------");
        });

    } catch (error) {
        console.error("Error checking course data:", error);
    } finally {
        await mongoose.disconnect();
    }
};

checkCourseData();
