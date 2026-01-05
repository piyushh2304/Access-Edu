"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPlaybackIdByCourseId = exports.fetchPlaybackIdFromMux = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Fetches playback ID from Mux API using asset ID
 * @param assetId - The Mux asset ID
 * @returns Object with playbackId, policy, and videoUrl, or null if failed
 */
const fetchPlaybackIdFromMux = async (assetId) => {
    try {
        const muxTokenId = process.env.MUX_TOKEN_ID;
        const muxTokenSecret = process.env.MUX_TOKEN_SECRET;
        if (!muxTokenId || !muxTokenSecret) {
            console.warn("MUX_TOKEN_ID or MUX_TOKEN_SECRET not set in environment variables");
            return null;
        }
        const auth = Buffer.from(`${muxTokenId}:${muxTokenSecret}`).toString("base64");
        console.log(`Fetching playback ID for asset: ${assetId}`);
        const response = await axios_1.default.get(`https://api.mux.com/video/v1/assets/${assetId}`, {
            headers: {
                Authorization: `Basic ${auth}`,
            },
        });
        console.log(`Mux API Response for ${assetId}:`, JSON.stringify(response.data?.data, null, 2));
        // Mux API returns playback_ids array - find the best one to use
        // Format: { "policy": "public", "id": "uNbxnGLKJ00yfbijDO8COxTOyVKT01xpxW" }
        if (response.data?.data?.playback_ids && response.data.data.playback_ids.length > 0) {
            const playbackIds = response.data.data.playback_ids;
            console.log(`Found ${playbackIds.length} playback ID(s) for asset ${assetId}:`, JSON.stringify(playbackIds, null, 2));
            // Prefer public playback IDs, then signed, then drm
            const publicPlaybackId = playbackIds.find((pid) => pid.policy === "public");
            const signedPlaybackId = playbackIds.find((pid) => pid.policy === "signed");
            const drmPlaybackId = playbackIds.find((pid) => pid.policy === "drm");
            // Use public playback ID if available (easiest for playback)
            const selectedPlaybackId = publicPlaybackId || signedPlaybackId || drmPlaybackId || playbackIds[0];
            // Extract the 'id' field from the playback ID object
            const playbackIdValue = selectedPlaybackId?.id;
            if (playbackIdValue) {
                console.log(`Selected playback ID: ${playbackIdValue}, Policy: ${selectedPlaybackId.policy}`);
                // For public playback IDs, we can construct the HLS URL
                let videoUrl = "";
                if (selectedPlaybackId.policy === "public") {
                    videoUrl = `https://stream.mux.com/${playbackIdValue}.m3u8`;
                }
                else {
                    // For signed/drm, the frontend will need to handle tokens/DRM
                    videoUrl = `https://stream.mux.com/${assetId}.m3u8`;
                }
                return {
                    playbackId: playbackIdValue,
                    policy: selectedPlaybackId.policy,
                    videoUrl,
                };
            }
            else {
                console.error(`Playback ID object missing 'id' field:`, selectedPlaybackId);
                return null;
            }
        }
        else {
            console.warn(`No playback IDs found for asset ${assetId}. Asset may not be ready.`);
            return null;
        }
    }
    catch (error) {
        console.error(`Failed to fetch playback ID for asset ${assetId}:`, error.message);
        if (error.response) {
            console.error("Mux API Error Response:", error.response.status, error.response.data);
        }
        return null;
    }
};
exports.fetchPlaybackIdFromMux = fetchPlaybackIdFromMux;
/**
 * Fetches playback ID from Mux API using course ID
 * Finds the course in database and fetches playback ID for the first video with muxAssetId
 * @param courseId - The course ID from database
 * @returns Object with playbackId, policy, videoUrl, and assetId, or null if failed
 */
const fetchPlaybackIdByCourseId = async (courseId) => {
    try {
        const CourseModel = (await Promise.resolve().then(() => __importStar(require("../models/course.model")))).default;
        const course = await CourseModel.findById(courseId);
        if (!course) {
            console.error(`Course not found with ID: ${courseId}`);
            return null;
        }
        const courseData = course.courseData;
        const videoWithAsset = courseData.find((item) => item.muxAssetId);
        if (!videoWithAsset || !videoWithAsset.muxAssetId) {
            console.error(`No video with muxAssetId found in course ${courseId}`);
            return null;
        }
        const playbackData = await (0, exports.fetchPlaybackIdFromMux)(videoWithAsset.muxAssetId);
        if (playbackData) {
            return {
                ...playbackData,
                assetId: videoWithAsset.muxAssetId,
                videoTitle: videoWithAsset.title || "Unknown",
            };
        }
        return null;
    }
    catch (error) {
        console.error(`Failed to fetch playback ID for course ${courseId}:`, error.message);
        return null;
    }
};
exports.fetchPlaybackIdByCourseId = fetchPlaybackIdByCourseId;
