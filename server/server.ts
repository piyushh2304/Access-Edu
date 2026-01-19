import dotenv from "dotenv";
dotenv.config();
import { app } from "./app";
import { v2 as cloudinary } from "cloudinary";
import http from "http";
import connectDB from "./utils/db";
import { initSocketServer } from "./socketServer";
const server = http.createServer(app);

// cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

initSocketServer(server);

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception: ", err);
  console.log("Shutting down the server due to Uncaught Exception");
  // process.exit(1); // Do not exit in production for now to debug
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: any) => {
  console.error("Unhandled Rejection: ", err.message);
  console.log("Shutting down the server due to Unhandled Promise Rejection");
  // server.close(() => process.exit(1)); // Do not exit
});

// create server
try {
  server.listen(process.env.PORT || 8000, () => {
    console.log(`Server is connected with port ${process.env.PORT || 8000}`);
    connectDB();
  });
} catch (error: any) {
  console.error("Server start failed:", error);
}
