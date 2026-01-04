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
// cors => cors origin resource sharing
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "https://access-edu.vercel.app",
        "https://access-edu-production.up.railway.app",
      ];

      if (process.env.ORIGIN) {
        try {
          // parse if it's a JSON array string
          const envOrigin = JSON.parse(process.env.ORIGIN);
          if (Array.isArray(envOrigin)) {
            allowedOrigins.push(...envOrigin);
          } else {
            allowedOrigins.push(process.env.ORIGIN);
          }
        } catch {
          // fallback if it's just a simple string
          allowedOrigins.push(process.env.ORIGIN);
        }
      }

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
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
app.use(limiter);

app.use(ErrorMidleware);
