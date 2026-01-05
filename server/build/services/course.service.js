"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCoursesService = exports.createCourse = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const course_model_1 = __importDefault(require("../models/course.model"));
const redis_1 = require("../utils/redis");
// create course
exports.createCourse = (0, catchAsyncErrors_1.CatchAsyncError)(async (data, res) => {
    console.log("Data received in createCourse:", data); // Add this line
    const course = await course_model_1.default.create({ ...data, status: "published" });
    await redis_1.redis.set(course._id, JSON.stringify(course), "EX", 604800); // 7 days
    await redis_1.redis.del("allCourses");
    res.status(201).json({
        success: true,
        course
    });
});
// Get all courses 
const getAllCoursesService = async (res) => {
    const courses = await course_model_1.default.find().sort({ createAt: -1 });
    res.status(201).json({
        success: true,
        courses,
    });
};
exports.getAllCoursesService = getAllCoursesService;
