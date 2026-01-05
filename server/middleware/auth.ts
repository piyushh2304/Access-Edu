import { Request, Response, NextFunction } from "express"
import { CatchAsyncError } from "./catchAsyncErrors"
import ErrorHandler from "../utils/ErrorHandler"
import jwt, { JwtPayload } from "jsonwebtoken"
import { redis } from "../utils/redis"
import { updateAccessToken } from "../controllers/user.controller"
import userModel from "../models/user.model"

// authenticated user
export const isAuthenticated = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    let access_token = req.cookies.access_token as string;
    const admin_access_token = req.cookies.admin_access_token as string;

    console.log("Cookies:", req.cookies); // Debugging
    console.log("Headers:", req.headers); // Debugging

    let refresh_token = req.cookies.refresh_token as string;
    const admin_refresh_token = req.cookies.admin_refresh_token as string;

    // Prioritize token based on Referer/Context if possible, or availability
    // Prioritize token based on Referer/Context
    const referer = req.headers.referer || '';
    if (referer.includes('/admin')) {
        access_token = admin_access_token || access_token;
    } else {
        access_token = access_token || admin_access_token;
    }

    // fallback for straightforward logic if referer is missing or ambiguous
    if (!access_token && admin_access_token) access_token = admin_access_token;

    // console.log(access_token)
    if (!access_token) {
        return next(new ErrorHandler("Please login to access this resource", 400));
    }

    const decoded = jwt.decode(access_token) as JwtPayload

    if (!decoded) {
        return next(new ErrorHandler("Access token is not valid", 400));
    }

    // check if the access token is expired
    if (decoded.exp && decoded.exp <= Date.now() / 1000) {
        console.log("[DEBUG] Token Expired, attempting refresh");
        try {
            await updateAccessToken(req, res, next)
        } catch (error: any) {
            new ErrorHandler("Please login to acces this resource", 400)
        }
    } else {
        const redisKey = decoded.id;
        console.log(`[DEBUG] Checking Redis Session Key: ${redisKey}`);

        let user;
        try {
            const session = await redis.get(redisKey);
            if (session) {
                user = JSON.parse(session);
            }
        } catch (err) {
            console.error('[WARN] Redis get failed, falling back to DB:', err);
        }

        if (!user) {
            console.log(`[DEBUG] Redis Key ${redisKey} NOT FOUND or Redis down, checking DB`);
            // Fallback to MongoDB
            user = await userModel.findById(decoded.id);
            if (!user) {
                return next(new ErrorHandler("Please login to access this resource", 400));
            }
        }

        req.user = user;

        next()
    }

})

// validate user role
export const authorizeRoles = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user?.role || '')) {
            return next(new ErrorHandler(`Role: ${req.user?.role} is not allowed to access this resource`, 403))
        }
        next()
    }
}