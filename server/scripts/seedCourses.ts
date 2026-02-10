
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

import mongoose from "mongoose";
import CourseModel from "../models/course.model";
import LayoutModel from "../models/layout.model";
import { redis } from "../utils/redis";

const dbUrl = process.env.MONGO_URI || "";

// Images available in public folder
const courseImages = [
    "course-images-101@2x.png", "course-images-102@2x.png", "course-images-10@2x.png",
    "course-images-110@2x.png", "course-images-111@2x.png", "course-images-112@2x.png",
    "course-images-113@2x.png", "course-images-114@2x.png", "course-images-115@2x.png",
    "course-images-116@2x.png", "course-images-11@2x.png", "course-images-121@2x.png",
    "course-images-12@2x.png", "course-images-131@2x.png", "course-images-13@2x.png",
    "course-images-141@2x.png", "course-images-14@2x.png", "course-images-151@2x.png",
    "course-images-15@2x.png", "course-images-161@2x.png", "course-images-162@2x.png",
    "course-images-16@2x.png", "course-images-17@2x.png", "course-images-18@2x.png",
    "course-images-19@2x.png", "course-images-1@2x.png", "course-images-21@2x.png",
    "course-images-22@2x.png", "course-images-23@2x.png", "course-images-24@2x.png",
    "course-images-25@2x.png", "course-images-26@2x.png", "course-images-2@2x.png",
    "course-images-31@2x.png", "course-images-32@2x.png", "course-images-33@2x.png",
    "course-images-34@2x.png", "course-images-3@2x.png", "course-images-41@2x.png",
    "course-images-42@2x.png", "course-images-43@2x.png", "course-images-44@2x.png",
    "course-images-4@2x.png", "course-images-51@2x.png", "course-images-52@2x.png",
    "course-images-53@2x.png", "course-images-54@2x.png", "course-images-5@2x.png"
];

const categories = ["Web Development", "Data Science", "Mobile App Development", "Design", "Cybersecurity", "Cloud Computing"];
const levels = ["Beginner", "Intermediate", "Advanced"];

const generateCourse = (index: number) => {
    const randomImage = courseImages[index % courseImages.length];
    const category = categories[index % categories.length];
    const level = levels[index % levels.length];
    const price = Math.floor(Math.random() * 100) + 20;

    return {
        name: `Course ${index + 1}: Master ${category} with Project ${index}`,
        description: `This is a comprehensive course about ${category}. You will learn everything from basics to advanced topics. Project ${index} included.`,
        categories: category,
        price: price,
        estimatedPrice: price * 2,
        thumbnail: {
            public_id: `course-${index}`,
            url: `/${randomImage}`
        },
        tags: `${category.toLowerCase().replace(/ /g, ', ')}, course ${index}`,
        level: level,
        demoUrl: "https://www.youtube.com/watch?v=Get7wqXYe38",
        benefits: [{ title: `Master ${category}` }, { title: "Build real-world projects" }, { title: "Get certified" }],
        prerequisites: [{ title: "Basic computer knowledge" }, { title: "Passion for learning" }],
        status: "Published",
        ratings: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
        purchased: Math.floor(Math.random() * 1000),
        reviews: [],
        courseData: []
    };
};

const seedCourses = async () => {
    try {
        await mongoose.connect(dbUrl);
        console.log("Database connected");

        const courses = [];
        for (let i = 0; i < 50; i++) {
            courses.push(generateCourse(i));
        }

        // 1. Insert Courses
        await CourseModel.insertMany(courses);
        console.log("50 Sample courses added successfully");

        // 2. Update Layout Categories
        const categoryData = categories.map(title => ({ title }));
        await LayoutModel.findOneAndUpdate(
            { type: "Categories" },
            {
                type: "Categories",
                categories: categoryData
            },
            { upsert: true, new: true }
        );
        console.log("Layout categories updated successfully");

        // 3. Clear Redis cache
        // Clear all relevant caches
        await redis.del("allCourses");
        await redis.del("Categories");
        await redis.del("layout"); // Just in case
        console.log("Redis cache cleared");

    } catch (error) {
        console.error("Error seeding courses:", error);
    } finally {
        await mongoose.disconnect();
        await redis.quit();
        console.log("Database and Redis disconnected");
    }
};

seedCourses();
