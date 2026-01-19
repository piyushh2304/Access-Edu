require('dotenv').config()
import { Response } from "express"
import { IUser } from "../models/user.model"
import { redis } from "./redis"

interface ITokenOptions {
    expires: Date;
    maxAge: number;
    httpOnly: boolean;
    sameSite: 'lax' | 'strict' | 'none' | undefined
    secure?: boolean
}

// parse enviroment variables to integates with fallback values 
const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || '300', 10)
const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || '1200', 10)

//option for cookies
export const accessTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000),
    maxAge: accessTokenExpire * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax'
};
export const refreshTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
    maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax'
};


export const sendToken = (user: IUser, statusCode: number, res: Response) => {
    const accessToken = user.SignAccessToken()
    const refreshToken = user.SignRefreshToken()

    // upload session to redis
    const redisKey = user._id.toString();
    console.log(`[DEBUG] Setting Redis Session Key: ${redisKey}`); // Debug
    redis.set(redisKey, JSON.stringify(user) as any)


    // only set secure to true in production
    if (process.env.NODE_ENV === 'production') {
        accessTokenOptions.secure = true;
        refreshTokenOptions.secure = true;
        accessTokenOptions.sameSite = 'none';
        refreshTokenOptions.sameSite = 'none';
    }

    // Check user role to determine cookie names
    const isOwner = user.role === 'admin';
    const accessTokenName = isOwner ? 'admin_access_token' : 'access_token';
    const refreshTokenName = isOwner ? 'admin_refresh_token' : 'refresh_token';

    res.cookie(accessTokenName, accessToken, accessTokenOptions)
    res.cookie(refreshTokenName, refreshToken, refreshTokenOptions)

    res.status(statusCode).json({
        success: true, user, accessToken
    })
}
