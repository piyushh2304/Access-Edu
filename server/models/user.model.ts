// server/models/user.model.ts
import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Define the interface for the user document
export interface IUser extends Document {
    name: string;
    email: string;
    password?: string; // Password is optional when fetching, but required during creation
    avatar: {
        public_id: string;
        url: string;
    };
    role: string;
    isVerified: boolean;
    courses: Array<{ courseId: string }>;
    // Methods for the user instance
    SignAccessToken(): string;
    SignRefreshToken(): string;
    comparePassword(enteredPassword: string): Promise<boolean>;
}

// Define the schema for the user
const userSchema: Schema<IUser> = new mongoose.Schema(
    {
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
    },
    { timestamps: true }
);

// Hash

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    // Only hash if password exists and is modified (e.g., when creating or updating password)
    if (this.password) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Sign access token
userSchema.methods.SignAccessToken = function (): string {
    return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN as string, {
        expiresIn: "24h",
    });
};

// Sign refresh token
userSchema.methods.SignRefreshToken = function (): string {
    return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN as string, {
        expiresIn: "365d",
    });
};

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
    // Ensure `this.password` is not undefined before comparing
    if (!this.password) {
        return false;
    }
    return await bcrypt.compare(enteredPassword, this.password);
};

const userModel: Model<IUser> = mongoose.model("User", userSchema);

export default userModel;
