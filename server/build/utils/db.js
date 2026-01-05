"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbUrl = process.env.MONGO_URI;
const connectDB = async () => {
    try {
        const data = await mongoose_1.default.connect(dbUrl);
        console.log(`✅ Database connected with ${data.connection.host}`);
    }
    catch (error) {
        console.error(`❌ MongoDB connection error: ${error.message}`);
        setTimeout(connectDB, 5000);
    }
};
exports.default = connectDB;
