"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/models/user.model.ts
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Define the schema for the user
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        // ADD THIS LINE: Create a unique index on the email field
        index: true,
    },
    password: {
        type: String,
        minlength: [6, "Password must be at least 6 characters"],
        select: false, // Don't return password by default
    },
    avatar: {
        public_id: String,
        url: String,
    },
    role: {
        type: String,
        default: "user",
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    courses: [
        {
            courseId: String,
        },
    ],
}, { timestamps: true });
// Hash
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    // Only hash if password exists and is modified (e.g., when creating or updating password)
    if (this.password) {
        this.password = await bcryptjs_1.default.hash(this.password, 10);
    }
    next();
});
// Sign access token
userSchema.methods.SignAccessToken = function () {
    return jsonwebtoken_1.default.sign({ id: this._id }, process.env.ACCESS_TOKEN, {
        expiresIn: "24h",
    });
};
// Sign refresh token
userSchema.methods.SignRefreshToken = function () {
    return jsonwebtoken_1.default.sign({ id: this._id }, process.env.REFRESH_TOKEN, {
        expiresIn: "365d",
    });
};
// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
    // Ensure `this.password` is not undefined before comparing
    if (!this.password) {
        return false;
    }
    return await bcryptjs_1.default.compare(enteredPassword, this.password);
};
const userModel = mongoose_1.default.model("User", userSchema);
exports.default = userModel;
