require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMidleware } from "./middleware/error";
import userRouter from "./routes/user.route";
import courseRouter from "./routes/course.route";
import orderRouter from "./routes/order.route";
import notificationRoute from "./routes/notification.route";
import analyticsRouter from "./routes/analytics.route";
import layoutRouter from "./routes/layout.route";
import { rateLimit } from "express-rate-limit";

// body parser
app.use(express.json({ limit: "50mb" }));

// cookie parser
app.use(cookieParser());

// cors => cors origin resource sharing
app.use(
  cors({
    origin: (origin, callback) => {
      const originEnv = process.env.ORIGIN;
      let allowedOrigins: string[] = [];

      if (originEnv) {
        try {
          // Try parsing as JSON array
          const parsed = JSON.parse(originEnv);
          allowedOrigins = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          // If not JSON, treat as a comma-separated string or single string
          allowedOrigins = originEnv.split(",").map((o) => o.trim());
        }
      }

      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Check if the origin is allowed
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      } else {
        const msg = "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
    },
    credentials: true,
  })
);

// api request limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

// routers
app.use(
  "/api/v1",
  limiter,
  userRouter,
  courseRouter,
  orderRouter,
  notificationRoute,
  analyticsRouter,
  layoutRouter
);

// testing api
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "API is working",
  });
});

// unknown route
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Router ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

// midleware call
// app.use(limiter);

app.use(ErrorMidleware);
