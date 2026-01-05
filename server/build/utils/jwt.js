"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToken = exports.refreshTokenOptions = exports.accessTokenOptions = void 0;
require('dotenv').config();
const redis_1 = require("./redis");
// parse enviroment variables to integates with fallback values 
const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || '300', 10);
const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || '1200', 10);
//option for cookies
exports.accessTokenOptions = {
    expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000),
    maxAge: accessTokenExpire * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax'
};
exports.refreshTokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
    maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax'
};
const sendToken = (user, statusCode, res) => {
    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();
    // upload session to redis
    const redisKey = user._id.toString();
    console.log(`[DEBUG] Setting Redis Session Key: ${redisKey}`); // Debug
    redis_1.redis.set(redisKey, JSON.stringify(user));
    // only set secure to true in production
    if (process.env.NODE_ENV === 'production') {
        exports.accessTokenOptions.secure = true;
    }
    // Check user role to determine cookie names
    const isOwner = user.role === 'admin';
    const accessTokenName = isOwner ? 'admin_access_token' : 'access_token';
    const refreshTokenName = isOwner ? 'admin_refresh_token' : 'refresh_token';
    res.cookie(accessTokenName, accessToken, exports.accessTokenOptions);
    res.cookie(refreshTokenName, refreshToken, exports.refreshTokenOptions);
    res.status(statusCode).json({
        success: true, user, accessToken
    });
};
exports.sendToken = sendToken;
