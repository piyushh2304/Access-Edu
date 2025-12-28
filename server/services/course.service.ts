import { Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import CourseModel from "../models/course.model";
import { redis } from "../utils/redis";

// create course
export const createCourse = CatchAsyncError(async (data: any, res: Response) => {
    console.log("Data received in createCourse:", data); // Add this line
    const course = await CourseModel.create({ ...data, status: "published" });
    await redis.set(course._id, JSON.stringify(course), "EX", 604800); // 7 days
    await redis.del("allCourses");
    res.status(201).json({
        success: true,
        course
    });
});

// Get all courses 
export const getAllCoursesService = async (res: Response) => {
    const courses = await CourseModel.find().sort({ createAt: -1 })

    res.status(201).json({
        success: true,
        courses,
    })
}