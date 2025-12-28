require("dotenv").config();
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

// create server
server.listen(process.env.PORT || 8000, () => {
  console.log(`Server is connected with port ${process.env.PORT || 8000}`);
  connectDB();
});
