"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const app_1 = require("./app");
const cloudinary_1 = require("cloudinary");
const http_1 = __importDefault(require("http"));
const db_1 = __importDefault(require("./utils/db"));
const socketServer_1 = require("./socketServer");
const server = http_1.default.createServer(app_1.app);
// cloudinary config
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
(0, socketServer_1.initSocketServer)(server);
// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception: ", err);
    console.log("Shutting down the server due to Uncaught Exception");
    // process.exit(1); // Do not exit in production for now to debug
});
// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection: ", err.message);
    console.log("Shutting down the server due to Unhandled Promise Rejection");
    // server.close(() => process.exit(1)); // Do not exit
});
// create server
try {
    server.listen(process.env.PORT || 8000, () => {
        console.log(`Server is connected with port ${process.env.PORT || 8000}`);
        (0, db_1.default)();
    });
}
catch (error) {
    console.error("Server start failed:", error);
}
