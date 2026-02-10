import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import { createCourse, getAllCoursesService } from "../services/course.service";
import CourseModel from "../models/course.model";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notification.model";
import axios from "axios";
import { fetchPlaybackIdFromMux, fetchPlaybackIdByCourseId } from "../utils/mux";



// generate Mux video url
const generateMuxVideoUrl = (muxAssetId: string): string => {
  return `https://stream.mux.com/${muxAssetId}.m3u8`;
};

/**
 * upload course
 */
export const uploadCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;
      if (thumbnail) {
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      createCourse(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

/**
 * edit course
 */
export const editCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;

      const courseId = req.params.id;
      const courseData = (await CourseModel.findById(courseId)) as any;

      if (thumbnail && !thumbnail.startsWith("https")) {
        await cloudinary.v2.uploader.destroy(courseData.thumbnail.public_id);

        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
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

      const course = await CourseModel.findByIdAndUpdate(
        courseId,
        {
          $set: data,
        },
        { new: true }
      );

      await redis.del("allCourses");
      await redis.set(courseId, JSON.stringify(course), "EX", 604800); // 7 days

      res.status(200).json({
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get single course --- without purchasing
export const getSingleCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;

      const isChacheExist = await redis.get(courseId);

      if (isChacheExist) {
        const course = JSON.parse(isChacheExist);
        res.status(200).json({
          success: true,
          course,
        });
      } else {
        const course = await CourseModel.findById(req.params.id).select(
          "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
        );

        await redis.set(courseId, JSON.stringify(course), "EX", 604800); // 7 days

        res.status(200).json({
          success: true,
          course,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get all course --- without purchasing
export const getAllCourses = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isChacheExist = await redis.get("allCourses")
      if (isChacheExist) {
        const courses = JSON.parse(isChacheExist)
        res.status(200).json({
          success: true,
          courses
        })
      } else {
        const courses = await CourseModel.find().select(
          "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links"
        );
        console.log(`[DEBUG] Fetched ${courses?.length} courses from DB`);

        await redis.set("allCourses", JSON.stringify(courses));

        res.status(200).json({
          success: true,
          courses,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

import userModel from "../models/user.model";

// get course content --- only for valid user
export const getCourseByUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCourseList = req.user?.courses;
      const courseId = req.params.id;

      const courseExists = userCourseList?.some((c: any) => {
        const id = typeof c === "string" ? c : c?.courseId || c?._id?.toString?.();
        return id === courseId;
      });
      if (!courseExists) {
        return next(
          new ErrorHandler("You are not eligible to access this course", 500)
        );
      }

      const course = await CourseModel.findById(courseId);

      const content = await Promise.all(
        course?.courseData.map(async (item: any) => {
          if (item.muxAssetId) {
            console.log(`[DEBUG] Processing asset: ${item.muxAssetId} for course content: ${item.title}`);

            // Priority 1: Use stored playbackId if it exists (manually set or previously fetched)
            if (item.playbackId && item.playbackId.trim()) {
              console.log(`[DEBUG] Using stored playback ID for asset ${item.muxAssetId}: ${item.playbackId}`);
              item.videoId = item.playbackId; // Frontend will use this as playbackId prop
              item.videoUrl = `https://stream.mux.com/${item.playbackId}.m3u8`;
              return item;
            }

            // Priority 2: Try to get playback ID from Mux API if not stored
            console.log(`[DEBUG] Fetching playback ID from Mux for asset: ${item.muxAssetId}`);
            const playbackData = await fetchPlaybackIdFromMux(item.muxAssetId);

            if (playbackData) {
              console.log(`[DEBUG] Received playback data for asset ${item.muxAssetId}:`, playbackData);
              // Set playbackId and videoId to the actual playback ID value
              item.playbackId = playbackData.playbackId;
              item.playbackPolicy = playbackData.policy;
              item.videoId = playbackData.playbackId; // Frontend will use this as playbackId prop
              item.videoUrl = playbackData.videoUrl;
            } else {
              // Fallback to asset ID if playback ID not available
              console.warn(`[DEBUG] Failed to fetch playback ID for asset ${item.muxAssetId}, using asset ID as fallback`);
              // Note: This fallback might be incorrect if the frontend expects a playback ID, not an asset ID
              item.videoUrl = generateMuxVideoUrl(item.muxAssetId);
              item.videoId = item.muxAssetId;
            }
          }
          return item;
        }) || []
      );

      console.log("[DEBUG] Final content payload:", JSON.stringify(content, null, 2));

      res.status(200).json({
        success: true,
        content,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const enrollInCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;
      const userId = req.user?._id;

      const user = await userModel.findById(userId);

      const courseExistsInUser = user?.courses.some((c: any) => {
        const id = typeof c === "string" ? c : c?.courseId || c?._id?.toString?.();
        return id === courseId;
      });

      if (courseExistsInUser) {
        return next(
          new ErrorHandler("You have already enrolled in this course", 400)
        );
      }

      const course = await CourseModel.findById(courseId);

      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }

      user?.courses.push({ courseId: course._id.toString() });

      await user?.save();
      await redis.set(userId, JSON.stringify(user));

      res.status(200).json({
        success: true,
        message: "Enrolled in course successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// add question in course
interface IAddQuestionData {
  question: string;
  courseId: string;
  contentId: string;
}

export const addQuestion = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question, courseId, contentId }: IAddQuestionData = req.body;
      const course = await CourseModel.findById(courseId);

      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("Invalid content id", 400));
      }

      const courseContent = course?.courseData?.find((item: any) =>
        item._id.equals(contentId)
      );

      if (!courseContent) {
        return next(new ErrorHandler("Invalid content id", 400));
      }

      // create a new question object
      const newQeustion: any = {
        user: req.user,
        question,
        questionReplies: [],
      };

      // add this question to our course content
      courseContent.questions.push(newQeustion);

      await NotificationModel.create({
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
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// add answer in course question
interface IAddAnswerData {
  answer: string;
  courseId: string;
  contentId: string;
  questionId: string;
}

export const addAnswer = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { answer, courseId, contentId, questionId }: IAddAnswerData =
        req.body;
      const course = await CourseModel.findById(courseId);

      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("Invalid content id", 400));
      }

      const courseContent = course?.courseData?.find((item: any) =>
        item._id.equals(contentId)
      );

      if (!courseContent) {
        return next(new ErrorHandler("Invalid content id", 400));
      }

      const question = courseContent?.questions?.find((item: any) =>
        item._id.equals(questionId)
      );

      if (!question) {
        return next(new ErrorHandler("Invalid question id", 400));
      }

      // create a new question object
      const newAnswer: any = {
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
        await NotificationModel.create({
          user: req.user?._id,
          title: "New Question Reply Received",
          message: `You have a new order from ${courseContent.title}`,
        });
      } else {
        const data = {
          name: question.user.name,
          title: courseContent.title,
        };
        const html = await ejs.renderFile(
          path.join(__dirname, "../mails/question-reply.ejs"),
          data
        );

        try {
          await sendMail({
            email: question.user.email,
            subject: "Question Reply",
            template: "question-reply.ejs",
            data,
          });
        } catch (error: any) {
          return next(new ErrorHandler(error.message, 500));
        }
      }
      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// add review in course
interface IAddReviewData {
  review: string;
  rating: string;
  userId: string;
}

export const addReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCourseList = req.user?.courses;

      const courseId = req.params.id;

      // check if courseId already exists in userCourseList based on _id
      const courseExists = userCourseList?.some((c: any) => {
        const id = typeof c === "string" ? c : c?.courseId || c?._id?.toString?.();
        return id === courseId.toString();
      });

      if (!courseExists) {
        return next(
          new ErrorHandler("You are not eligible to access this course", 404)
        );
      }

      const course = await CourseModel.findById(courseId);

      const { review, rating } = req.body as IAddReviewData;

      const reviewData: any = {
        user: req.user,
        rating,
        comment: review,
      };

      course?.reviews.push(reviewData);

      // make avarage rating
      let avg = 0;
      course?.reviews.forEach((rev: any) => {
        avg += rev.rating;
      });
      if (course) {
        course.ratings = avg / course.reviews.length;
      }

      await course?.save();

      await redis.set(courseId, JSON.stringify(course), "EX", 604800); // 7 days

      // create notification
      await NotificationModel.create({
        user: req.user?._id,
        title: "New Review Received",
        message: `${req.user?.name} has given a review in ${course?.name}`,
      });

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// add reply in review
interface IAddReviewData {
  comment: string;
  courseId: string;
  reviewId: string;
}

export const addReplyToReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { comment, courseId, reviewId } = req.body as IAddReviewData;

      const course = await CourseModel.findById(courseId);

      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }

      const review = course?.reviews?.find(
        (rev: any) => rev._id.toString() === reviewId
      );

      if (!review) {
        return next(new ErrorHandler("Review not found", 404));
      }

      const replyData: any = {
        user: req.user,
        comment,
      };

      if (!review.commentReplies) {
        review.commentReplies = [];
      }

      review.commentReplies?.push(replyData);

      await course?.save();

      await redis.set(courseId, JSON.stringify(course), "EX", 604800); // 7 days

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get all courses--- only for admin
export const getAdminCourses = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isChacheExist = await redis.get("allCourses")
      if (isChacheExist) {
        const courses = JSON.parse(isChacheExist)
        res.status(200).json({
          success: true,
          courses
        })
      } else {
        const courses = await CourseModel.find().sort({ createdAt: -1 });

        await redis.set("allCourses", JSON.stringify(courses));

        res.status(200).json({
          success: true,
          courses,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// delete course-- only for admin
/**
 * Fetch playback ID from Mux API using asset ID or course ID
 * GET /api/v1/course/get-playback-id?assetId=xxx or ?courseId=xxx
 */
export const getPlaybackId = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { assetId, courseId } = req.query;

      if (!assetId && !courseId) {
        return next(new ErrorHandler("Please provide either assetId or courseId", 400));
      }

      let playbackData = null;

      if (assetId) {
        // Fetch playback ID using asset ID
        playbackData = await fetchPlaybackIdFromMux(assetId as string);

        if (!playbackData) {
          return res.status(404).json({
            success: false,
            message: `Failed to fetch playback ID for asset ID: ${assetId}`,
          });
        }

        res.status(200).json({
          success: true,
          data: {
            assetId: assetId as string,
            playbackId: playbackData.playbackId,
            policy: playbackData.policy,
            videoUrl: playbackData.videoUrl,
          },
        });
      } else if (courseId) {
        // Fetch playback ID using course ID
        playbackData = await fetchPlaybackIdByCourseId(courseId as string);

        if (!playbackData) {
          return res.status(404).json({
            success: false,
            message: `Failed to fetch playback ID for course ID: ${courseId}`,
          });
        }

        res.status(200).json({
          success: true,
          data: {
            courseId: courseId as string,
            assetId: playbackData.assetId,
            videoTitle: playbackData.videoTitle,
            playbackId: playbackData.playbackId,
            policy: playbackData.policy,
            videoUrl: playbackData.videoUrl,
          },
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const deleteCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.body;

      const course = await CourseModel.findById(id);

      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }

      await course.deleteOne({ id });

      await redis.del(id);

      res.status(201).json({
        success: true,
        message: "Course deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
