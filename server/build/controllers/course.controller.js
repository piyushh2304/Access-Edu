"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCourse = exports.getPlaybackId = exports.getAdminCourses = exports.addReplyToReview = exports.addReview = exports.addAnswer = exports.addQuestion = exports.enrollInCourse = exports.getCourseByUser = exports.getAllCourses = exports.getSingleCourse = exports.editCourse = exports.uploadCourse = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const course_service_1 = require("../services/course.service");
const course_model_1 = __importDefault(require("../models/course.model"));
const redis_1 = require("../utils/redis");
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const mux_1 = require("../utils/mux");
// generate Mux video url
const generateMuxVideoUrl = (muxAssetId) => {
    return `https://stream.mux.com/${muxAssetId}.m3u8`;
};
/**
 * upload course
 */
exports.uploadCourse = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        if (thumbnail) {
            const myCloud = await cloudinary_1.default.v2.uploader.upload(thumbnail, {
                folder: "courses",
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        (0, course_service_1.createCourse)(data, res, next);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
/**
 * edit course
 */
exports.editCourse = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        const courseId = req.params.id;
        const courseData = (await course_model_1.default.findById(courseId));
        if (thumbnail && !thumbnail.startsWith("https")) {
            await cloudinary_1.default.v2.uploader.destroy(courseData.thumbnail.public_id);
            const myCloud = await cloudinary_1.default.v2.uploader.upload(thumbnail, {
                folder: "courses",
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        if (thumbnail.startsWith("https")) {
            data.thumbnail = {
                public_id: courseData?.thumbnail.public_id,
                url: courseData?.thumbnail.url,
            };
        }
        const course = await course_model_1.default.findByIdAndUpdate(courseId, {
            $set: data,
        }, { new: true });
        await redis_1.redis.del("allCourses");
        await redis_1.redis.set(courseId, JSON.stringify(course), "EX", 604800); // 7 days
        res.status(200).json({});
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// get single course --- without purchasing
exports.getSingleCourse = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const courseId = req.params.id;
        const isChacheExist = await redis_1.redis.get(courseId);
        if (isChacheExist) {
            const course = JSON.parse(isChacheExist);
            res.status(200).json({
                success: true,
                course,
            });
        }
        else {
            const course = await course_model_1.default.findById(req.params.id).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
            await redis_1.redis.set(courseId, JSON.stringify(course), "EX", 604800); // 7 days
            res.status(200).json({
                success: true,
                course,
            });
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// get all course --- without purchasing
exports.getAllCourses = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const isChacheExist = await redis_1.redis.get("allCourses");
        if (isChacheExist) {
            const courses = JSON.parse(isChacheExist);
            res.status(200).json({
                success: true,
                courses
            });
        }
        else {
            const courses = await course_model_1.default.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
            console.log(`[DEBUG] Fetched ${courses?.length} courses from DB`);
            await redis_1.redis.set("allCourses", JSON.stringify(courses));
            res.status(200).json({
                success: true,
                courses,
            });
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
const user_model_1 = __importDefault(require("../models/user.model"));
// get course content --- only for valid user
exports.getCourseByUser = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;
        const courseExists = userCourseList?.some((c) => {
            const id = typeof c === "string" ? c : c?.courseId || c?._id?.toString?.();
            return id === courseId;
        });
        if (!courseExists) {
            return next(new ErrorHandler_1.default("You are not eligible to access this course", 500));
        }
        const course = await course_model_1.default.findById(courseId);
        const content = await Promise.all(course?.courseData.map(async (item) => {
            if (item.muxAssetId) {
                // Priority 1: Use stored playbackId if it exists (manually set or previously fetched)
                if (item.playbackId && item.playbackId.trim()) {
                    console.log(`Using stored playback ID for asset ${item.muxAssetId}: ${item.playbackId}`);
                    item.videoId = item.playbackId; // Frontend will use this as playbackId prop
                    item.videoUrl = `https://stream.mux.com/${item.playbackId}.m3u8`;
                    return item;
                }
                // Priority 2: Try to get playback ID from Mux API if not stored
                const playbackData = await (0, mux_1.fetchPlaybackIdFromMux)(item.muxAssetId);
                if (playbackData) {
                    // Set playbackId and videoId to the actual playback ID value
                    item.playbackId = playbackData.playbackId;
                    item.playbackPolicy = playbackData.policy;
                    item.videoId = playbackData.playbackId; // Frontend will use this as playbackId prop
                    item.videoUrl = playbackData.videoUrl;
                }
                else {
                    // Fallback to asset ID if playback ID not available
                    console.warn(`Failed to fetch playback ID for asset ${item.muxAssetId}, using asset ID as fallback`);
                    item.videoUrl = generateMuxVideoUrl(item.muxAssetId);
                    item.videoId = item.muxAssetId;
                }
            }
            return item;
        }) || []);
        res.status(200).json({
            success: true,
            content,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.enrollInCourse = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const courseId = req.params.id;
        const userId = req.user?._id;
        const user = await user_model_1.default.findById(userId);
        const courseExistsInUser = user?.courses.some((c) => {
            const id = typeof c === "string" ? c : c?.courseId || c?._id?.toString?.();
            return id === courseId;
        });
        if (courseExistsInUser) {
            return next(new ErrorHandler_1.default("You have already enrolled in this course", 400));
        }
        const course = await course_model_1.default.findById(courseId);
        if (!course) {
            return next(new ErrorHandler_1.default("Course not found", 404));
        }
        user?.courses.push({ courseId: course._id.toString() });
        await user?.save();
        await redis_1.redis.set(userId, JSON.stringify(user));
        res.status(200).json({
            success: true,
            message: "Enrolled in course successfully",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.addQuestion = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { question, courseId, contentId } = req.body;
        const course = await course_model_1.default.findById(courseId);
        if (!mongoose_1.default.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler_1.default("Invalid content id", 400));
        }
        const courseContent = course?.courseData?.find((item) => item._id.equals(contentId));
        if (!courseContent) {
            return next(new ErrorHandler_1.default("Invalid content id", 400));
        }
        // create a new question object
        const newQeustion = {
            user: req.user,
            question,
            questionReplies: [],
        };
        // add this question to our course content
        courseContent.questions.push(newQeustion);
        await notification_model_1.default.create({
            user: req.user?._id,
            title: "New Question",
            message: `You have a new order from ${courseContent.title}`,
        });
        // save the updated course
        await course?.save();
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.addAnswer = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { answer, courseId, contentId, questionId } = req.body;
        const course = await course_model_1.default.findById(courseId);
        if (!mongoose_1.default.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler_1.default("Invalid content id", 400));
        }
        const courseContent = course?.courseData?.find((item) => item._id.equals(contentId));
        if (!courseContent) {
            return next(new ErrorHandler_1.default("Invalid content id", 400));
        }
        const question = courseContent?.questions?.find((item) => item._id.equals(questionId));
        if (!question) {
            return next(new ErrorHandler_1.default("Invalid question id", 400));
        }
        // create a new question object
        const newAnswer = {
            user: req.user,
            answer,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        // add this question to our course content
        question.questionReplies?.push(newAnswer);
        // save the updated course
        await course?.save();
        if (req.user?._id === question.user._id) {
            // create a notification
            await notification_model_1.default.create({
                user: req.user?._id,
                title: "New Question Reply Received",
                message: `You have a new order from ${courseContent.title}`,
            });
        }
        else {
            const data = {
                name: question.user.name,
                title: courseContent.title,
            };
            const html = await ejs_1.default.renderFile(path_1.default.join(__dirname, "../mails/question-reply.ejs"), data);
            try {
                await (0, sendMail_1.default)({
                    email: question.user.email,
                    subject: "Question Reply",
                    template: "question-reply.ejs",
                    data,
                });
            }
            catch (error) {
                return next(new ErrorHandler_1.default(error.message, 500));
            }
        }
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.addReview = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;
        // check if courseId already exists in userCourseList based on _id
        const courseExists = userCourseList?.some((c) => {
            const id = typeof c === "string" ? c : c?.courseId || c?._id?.toString?.();
            return id === courseId.toString();
        });
        if (!courseExists) {
            return next(new ErrorHandler_1.default("You are not eligible to access this course", 404));
        }
        const course = await course_model_1.default.findById(courseId);
        const { review, rating } = req.body;
        const reviewData = {
            user: req.user,
            rating,
            comment: review,
        };
        course?.reviews.push(reviewData);
        // make avarage rating
        let avg = 0;
        course?.reviews.forEach((rev) => {
            avg += rev.rating;
        });
        if (course) {
            course.ratings = avg / course.reviews.length;
        }
        await course?.save();
        await redis_1.redis.set(courseId, JSON.stringify(course), "EX", 604800); // 7 days
        // create notification
        await notification_model_1.default.create({
            user: req.user?._id,
            title: "New Review Received",
            message: `${req.user?.name} has given a review in ${course?.name}`,
        });
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.addReplyToReview = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { comment, courseId, reviewId } = req.body;
        const course = await course_model_1.default.findById(courseId);
        if (!course) {
            return next(new ErrorHandler_1.default("Course not found", 404));
        }
        const review = course?.reviews?.find((rev) => rev._id.toString() === reviewId);
        if (!review) {
            return next(new ErrorHandler_1.default("Review not found", 404));
        }
        const replyData = {
            user: req.user,
            comment,
        };
        if (!review.commentReplies) {
            review.commentReplies = [];
        }
        review.commentReplies?.push(replyData);
        await course?.save();
        await redis_1.redis.set(courseId, JSON.stringify(course), "EX", 604800); // 7 days
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// get all courses--- only for admin
exports.getAdminCourses = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const isChacheExist = await redis_1.redis.get("allCourses");
        if (isChacheExist) {
            const courses = JSON.parse(isChacheExist);
            res.status(200).json({
                success: true,
                courses
            });
        }
        else {
            const courses = await course_model_1.default.find().sort({ createdAt: -1 });
            await redis_1.redis.set("allCourses", JSON.stringify(courses));
            res.status(200).json({
                success: true,
                courses,
            });
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// delete course-- only for admin
/**
 * Fetch playback ID from Mux API using asset ID or course ID
 * GET /api/v1/course/get-playback-id?assetId=xxx or ?courseId=xxx
 */
exports.getPlaybackId = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { assetId, courseId } = req.query;
        if (!assetId && !courseId) {
            return next(new ErrorHandler_1.default("Please provide either assetId or courseId", 400));
        }
        let playbackData = null;
        if (assetId) {
            // Fetch playback ID using asset ID
            playbackData = await (0, mux_1.fetchPlaybackIdFromMux)(assetId);
            if (!playbackData) {
                return res.status(404).json({
                    success: false,
                    message: `Failed to fetch playback ID for asset ID: ${assetId}`,
                });
            }
            res.status(200).json({
                success: true,
                data: {
                    assetId: assetId,
                    playbackId: playbackData.playbackId,
                    policy: playbackData.policy,
                    videoUrl: playbackData.videoUrl,
                },
            });
        }
        else if (courseId) {
            // Fetch playback ID using course ID
            playbackData = await (0, mux_1.fetchPlaybackIdByCourseId)(courseId);
            if (!playbackData) {
                return res.status(404).json({
                    success: false,
                    message: `Failed to fetch playback ID for course ID: ${courseId}`,
                });
            }
            res.status(200).json({
                success: true,
                data: {
                    courseId: courseId,
                    assetId: playbackData.assetId,
                    videoTitle: playbackData.videoTitle,
                    playbackId: playbackData.playbackId,
                    policy: playbackData.policy,
                    videoUrl: playbackData.videoUrl,
                },
            });
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.deleteCourse = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { id } = req.body;
        const course = await course_model_1.default.findById(id);
        if (!course) {
            return next(new ErrorHandler_1.default("Course not found", 404));
        }
        await course.deleteOne({ id });
        await redis_1.redis.del(id);
        res.status(201).json({
            success: true,
            message: "Course deleted successfully",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
