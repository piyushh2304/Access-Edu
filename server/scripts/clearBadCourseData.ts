require('dotenv').config();
import mongoose from "mongoose";
import CourseModel from "../models/course.model";

const clearBadCourseData = async () => {
    try {
        const dbUrl = process.env.MONGO_URI || "";
        await mongoose.connect(dbUrl);
        console.log("Database connected");

        const badImage = "/course-images-101@2x.png";

        // Find courses with the bad image
        const courses = await CourseModel.find({ "thumbnail.url": badImage });
        console.log(`Found ${courses.length} courses with bad image: ${badImage}`);

        if (courses.length > 0) {
            const result = await CourseModel.deleteMany({ "thumbnail.url": badImage });
            console.log(`Deleted ${result.deletedCount} courses.`);
        } else {
            console.log("No courses found with that specific bad image.");
        }

    } catch (error) {
        console.error("Error clearing bad course data:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Database disconnected");
    }
};

clearBadCourseData();
