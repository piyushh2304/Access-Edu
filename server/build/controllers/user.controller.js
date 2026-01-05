"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUserRole = exports.getAllUsers = exports.updateProfilePicture = exports.updatePassword = exports.updateUserInfo = exports.socialAuth = exports.getUserInfo = exports.updateAccessToken = exports.logoutUser = exports.loginUser = exports.activateUser = exports.createActivationToken = exports.registrationUser = void 0;
require('dotenv').config();
const user_model_1 = __importDefault(require("../models/user.model"));
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const jwt_1 = require("../utils/jwt");
const redis_1 = require("../utils/redis");
const user_service_1 = require("../services/user.service");
const cloudinary_1 = __importDefault(require("cloudinary"));
exports.registrationUser = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        const isEmailExist = await user_model_1.default.findOne({ email });
        if (isEmailExist) {
            return next(new ErrorHandler_1.default("Email already exist", 400));
        }
        const user = {
            name, email, password, role
        };
        const activationToken = (0, exports.createActivationToken)(user);
        const activationCode = activationToken.activationCode;
        const data = { user: { name: user.name }, activationCode };
        const html = await ejs_1.default.renderFile(path_1.default.join(__dirname, "../mails/activation-mail.ejs"), data);
        try {
            await (0, sendMail_1.default)({
                email: user.email,
                subject: "Activate your account",
                template: "activation-mail.ejs",
                data,
            });
            res.status(201).json({
                success: true,
                message: `Please check your email: ${user.email} to activate your account!`,
                activationToken: activationToken.token,
                // Expose activationCode only in non-production environments for dev convenience
                activationCode: process.env.NODE_ENV !== 'production' ? activationCode : undefined,
            });
        }
        catch (error) {
            return next(new ErrorHandler_1.default(error.message, 400));
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
const createActivationToken = (user) => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = jsonwebtoken_1.default.sign({
        user, activationCode
    }, process.env.ACTIVATION_SECRET, {
        expiresIn: "5m"
    });
    return { token, activationCode };
};
exports.createActivationToken = createActivationToken;
exports.activateUser = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { activation_token, activation_code } = req.body;
        const newUser = jsonwebtoken_1.default.verify(activation_token, process.env.ACTIVATION_SECRET);
        if (newUser.activationCode !== activation_code) {
            return next(new ErrorHandler_1.default("Invalid activation code", 400));
        }
        const { name, email, password, role } = newUser.user;
        const existUser = await user_model_1.default.findOne({ email });
        if (existUser) {
            return next(new ErrorHandler_1.default("Email already exist", 400));
        }
        const user = await user_model_1.default.create({
            name, email, password, role: role || "user"
        });
        res.status(201).json({
            success: true,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
exports.loginUser = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new ErrorHandler_1.default("Please enter email and password", 400));
        }
        const user = await user_model_1.default.findOne({ email }).select("+password");
        if (!user) {
            return next(new ErrorHandler_1.default("Invalid email or password", 400));
        }
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return next(new ErrorHandler_1.default("Invalid email or password", 400));
        }
        (0, jwt_1.sendToken)(user, 200, res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
/**
 * logout user
 */
exports.logoutUser = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        res.cookie("access_token", "", { maxAge: 1 });
        res.cookie("refresh_token", "", { maxAge: 1 });
        res.cookie("admin_access_token", "", { maxAge: 1 });
        res.cookie("admin_refresh_token", "", { maxAge: 1 });
        try {
            const userId = req.user?._id || "";
            if (userId)
                await redis_1.redis.del(userId);
        }
        catch (e) {
            console.error('Redis del failed', e);
        }
        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
/**
 * update access token
 */
exports.updateAccessToken = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        let refresh_token = req.cookies.refresh_token;
        const admin_refresh_token = req.cookies.admin_refresh_token;
        const referer = req.headers.referer || '';
        if (referer.includes('/admin')) {
            refresh_token = admin_refresh_token || refresh_token;
        }
        else {
            refresh_token = refresh_token || admin_refresh_token;
        }
        const decoded = jsonwebtoken_1.default.verify(refresh_token, process.env.REFRESH_TOKEN);
        const message = 'Could not refresh token';
        if (!decoded) {
            return next(new ErrorHandler_1.default(message, 400));
        }
        let user;
        try {
            const session = await redis_1.redis.get(decoded.id);
            if (session) {
                user = JSON.parse(session);
            }
        }
        catch (error) {
            console.error('Redis error', error);
        }
        if (!user) {
            user = await user_model_1.default.findById(decoded.id);
            // If still no user, then fail
            if (!user) {
                return next(new ErrorHandler_1.default("Please login for access this resources", 400));
            }
        }
        const accessToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.ACCESS_TOKEN, {
            expiresIn: "24h"
        });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.REFRESH_TOKEN, {
            expiresIn: "365d"
        });
        req.user = user;
        const isOwner = user.role === 'admin';
        const accessTokenName = isOwner ? 'admin_access_token' : 'access_token';
        const refreshTokenName = isOwner ? 'admin_refresh_token' : 'refresh_token';
        res.cookie(accessTokenName, accessToken, jwt_1.accessTokenOptions);
        res.cookie(refreshTokenName, refreshToken, jwt_1.refreshTokenOptions);
        try {
            await redis_1.redis.set(user._id, JSON.stringify(user), "EX", 31536000); // 365 days
        }
        catch (err) {
            console.error('Redis set failed', err);
        }
        next();
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
/**
 * get user info
 */
exports.getUserInfo = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const userId = req.user?._id;
        (0, user_service_1.getUserById)(userId, res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
exports.socialAuth = (0, catchAsyncErrors_1.CatchAsyncError)(// Ekspor fungsi socialAuth dengan penggunaan middleware CatchAsyncError
async (req, res, next) => {
    try {
        console.log("[DEBUG] socialAuth called with body:", req.body);
        const { email, name, avatar } = req.body; // Mendapatkan email, name, dan avatar dari objek req.body dan memastikan bahwa tipe datanya sesuai dengan ISocialAuthBody
        const user = await user_model_1.default.findOne({ email }); // Mencari pengguna berdasarkan alamat email
        if (!user) { // Jika pengguna tidak ditemukan
            const newUser = await user_model_1.default.create({ email, name, avatar }); // Buat pengguna baru dengan informasi yang diberikan
            (0, jwt_1.sendToken)(newUser, 200, res); // Kirim token untuk pengguna baru
        }
        else { // Jika pengguna sudah ada
            (0, jwt_1.sendToken)(user, 200, res); // Kirim token untuk pengguna yang sudah ada
        }
    }
    catch (error) { // Menangkap kesalahan apa pun yang mungkin terjadi
        return next(new ErrorHandler_1.default(error.message, 400)); // Memanggil middleware next dengan objek error yang dibuat menggunakan ErrorHandler dan kode status 400
    }
});
exports.updateUserInfo = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { name } = req.body;
        const userId = req.user?._id;
        const user = await user_model_1.default.findById(userId);
        // if (email && user) {
        //     const isEmailExist = await userModel.findOne({ email })
        //     if (isEmailExist) {
        //         return next(new ErrorHandler("Email already exist", 400))
        //     }
        //     user.email = email
        // }
        if (name && user) {
            user.name = name;
        }
        await user?.save();
        try {
            await redis_1.redis.set(userId, JSON.stringify(user));
        }
        catch (e) {
            console.error('Redis set failed', e);
        }
        res.status(201).json({
            success: true,
            user
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
exports.updatePassword = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return next(new ErrorHandler_1.default("Please enter old and new password", 400));
        }
        const userId = req.user?._id;
        const user = await user_model_1.default.findById(userId).select("+password");
        if (user?.password == undefined) {
            return next(new ErrorHandler_1.default("Invalid user", 400));
        }
        const isPasswordMatch = await user?.comparePassword(oldPassword);
        if (!isPasswordMatch) {
            return next(new ErrorHandler_1.default("Invalid old password", 400));
        }
        user.password = newPassword;
        await user?.save();
        try {
            await redis_1.redis.set(req.user?._id, JSON.stringify(user));
        }
        catch (e) {
            console.error('Redis set failed', e);
        }
        res.status(201).json({
            success: true,
            user
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
/**
 * update profile picture
 */
exports.updateProfilePicture = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { avatar } = req.body;
        const userId = req.user?._id;
        const user = await user_model_1.default.findById(userId);
        if (avatar && user) {
            // if user have one avatar then call this if
            if (user?.avatar?.public_id) {
                // fisrt delete the old image
                await cloudinary_1.default.v2.uploader.destroy(user?.avatar?.public_id);
                const myCloud = await cloudinary_1.default.v2.uploader.upload(avatar, {
                    folder: "avatars",
                    width: 150
                });
                user.avatar = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url
                };
            }
            else {
                const myCloud = await cloudinary_1.default.v2.uploader.upload(avatar, {
                    folder: "avatars",
                    width: 150
                });
                user.avatar = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url
                };
            }
        }
        await user?.save();
        try {
            await redis_1.redis.set(userId, JSON.stringify(user));
        }
        catch (e) {
            console.error('Redis set failed', e);
        }
        res.status(201).json({
            success: true,
            user
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// get all users --- only for admin
exports.getAllUsers = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        (0, user_service_1.getAllUsersService)(res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// update user role -- only for admin
exports.updateUserRole = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { email, role } = req.body;
        const isUserExits = await user_model_1.default.findOne({ email });
        if (isUserExits) {
            const id = isUserExits._id;
            (0, user_service_1.updatetUserRoleService)(res, id, role);
        }
        else {
            res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// delet user -- only for admin
exports.deleteUser = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { id } = req.body;
        const user = await user_model_1.default.findById(id);
        if (!user) {
            return next(new ErrorHandler_1.default("User not found", 404));
        }
        await user.deleteOne();
        try {
            await redis_1.redis.del(id);
        }
        catch (e) {
            console.error('Redis del failed', e);
        }
        res.status(200).json({
            success: true,
            message: "User deleted successfully"
            // message: `ini adalah ${id}`
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
