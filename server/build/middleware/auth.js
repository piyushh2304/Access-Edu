"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.isAuthenticated = void 0;
const catchAsyncErrors_1 = require("./catchAsyncErrors");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const redis_1 = require("../utils/redis");
const user_controller_1 = require("../controllers/user.controller");
const user_model_1 = __importDefault(require("../models/user.model"));
// authenticated user
exports.isAuthenticated = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    let access_token = req.cookies.access_token;
    const admin_access_token = req.cookies.admin_access_token;
    console.log("Cookies:", req.cookies); // Debugging
    console.log("Headers:", req.headers); // Debugging
    let refresh_token = req.cookies.refresh_token;
    const admin_refresh_token = req.cookies.admin_refresh_token;
    // Prioritize token based on Referer/Context if possible, or availability
    // Prioritize token based on Referer/Context
    const referer = req.headers.referer || '';
    if (referer.includes('/admin')) {
        access_token = admin_access_token || access_token;
    }
    else {
        access_token = access_token || admin_access_token;
    }
    // fallback for straightforward logic if referer is missing or ambiguous
    if (!access_token && admin_access_token)
        access_token = admin_access_token;
    // console.log(access_token)
    if (!access_token) {
        return next(new ErrorHandler_1.default("Please login to access this resource", 400));
    }
    const decoded = jsonwebtoken_1.default.decode(access_token);
    if (!decoded) {
        return next(new ErrorHandler_1.default("Access token is not valid", 400));
    }
    // check if the access token is expired
    if (decoded.exp && decoded.exp <= Date.now() / 1000) {
        console.log("[DEBUG] Token Expired, attempting refresh");
        try {
            await (0, user_controller_1.updateAccessToken)(req, res, next);
        }
        catch (error) {
            new ErrorHandler_1.default("Please login to acces this resource", 400);
        }
    }
    else {
        const redisKey = decoded.id;
        console.log(`[DEBUG] Checking Redis Session Key: ${redisKey}`);
        let user;
        try {
            const session = await redis_1.redis.get(redisKey);
            if (session) {
                user = JSON.parse(session);
            }
        }
        catch (err) {
            console.error('[WARN] Redis get failed, falling back to DB:', err);
        }
        if (!user) {
            console.log(`[DEBUG] Redis Key ${redisKey} NOT FOUND or Redis down, checking DB`);
            // Fallback to MongoDB
            user = await user_model_1.default.findById(decoded.id);
            if (!user) {
                return next(new ErrorHandler_1.default("Please login to access this resource", 400));
            }
        }
        req.user = user;
        next();
    }
});
// validate user role
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user?.role || '')) {
            return next(new ErrorHandler_1.default(`Role: ${req.user?.role} is not allowed to access this resource`, 403));
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
