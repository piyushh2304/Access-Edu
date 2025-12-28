import axios from "axios";

/**
 * Fetches playback ID from Mux API using asset ID
 * @param assetId - The Mux asset ID
 * @returns Object with playbackId, policy, and videoUrl, or null if failed
 */
export const fetchPlaybackIdFromMux = async (
  assetId: string
): Promise<{
  playbackId: string;
  policy: string;
  videoUrl: string;
} | null> => {
  try {
    const muxTokenId = process.env.MUX_TOKEN_ID;
    const muxTokenSecret = process.env.MUX_TOKEN_SECRET;

    if (!muxTokenId || !muxTokenSecret) {
      console.warn("MUX_TOKEN_ID or MUX_TOKEN_SECRET not set in environment variables");
      return null;
    }

    const auth = Buffer.from(`${muxTokenId}:${muxTokenSecret}`).toString("base64");
    console.log(`Fetching playback ID for asset: ${assetId}`);

    const response = await axios.get(`https://api.mux.com/video/v1/assets/${assetId}`, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    console.log(`Mux API Response for ${assetId}:`, JSON.stringify(response.data?.data, null, 2));

    // Mux API returns playback_ids array - find the best one to use
    // Format: { "policy": "public", "id": "uNbxnGLKJ00yfbijDO8COxTOyVKT01xpxW" }
    if (response.data?.data?.playback_ids && response.data.data.playback_ids.length > 0) {
      const playbackIds = response.data.data.playback_ids;
      console.log(
        `Found ${playbackIds.length} playback ID(s) for asset ${assetId}:`,
        JSON.stringify(playbackIds, null, 2)
      );

      // Prefer public playback IDs, then signed, then drm
      const publicPlaybackId = playbackIds.find((pid: any) => pid.policy === "public");
      const signedPlaybackId = playbackIds.find((pid: any) => pid.policy === "signed");
      const drmPlaybackId = playbackIds.find((pid: any) => pid.policy === "drm");

      // Use public playback ID if available (easiest for playback)
      const selectedPlaybackId =
        publicPlaybackId || signedPlaybackId || drmPlaybackId || playbackIds[0];

      // Extract the 'id' field from the playback ID object
      const playbackIdValue = selectedPlaybackId?.id;

      if (playbackIdValue) {
        console.log(
          `Selected playback ID: ${playbackIdValue}, Policy: ${selectedPlaybackId.policy}`
        );

        // For public playback IDs, we can construct the HLS URL
        let videoUrl = "";
        if (selectedPlaybackId.policy === "public") {
          videoUrl = `https://stream.mux.com/${playbackIdValue}.m3u8`;
        } else {
          // For signed/drm, the frontend will need to handle tokens/DRM
          videoUrl = `https://stream.mux.com/${assetId}.m3u8`;
        }

        return {
          playbackId: playbackIdValue,
          policy: selectedPlaybackId.policy,
          videoUrl,
        };
      } else {
        console.error(`Playback ID object missing 'id' field:`, selectedPlaybackId);
        return null;
      }
    } else {
      console.warn(`No playback IDs found for asset ${assetId}. Asset may not be ready.`);
      return null;
    }
  } catch (error: any) {
    console.error(`Failed to fetch playback ID for asset ${assetId}:`, error.message);
    if (error.response) {
      console.error("Mux API Error Response:", error.response.status, error.response.data);
    }
    return null;
  }
};

/**
 * Fetches playback ID from Mux API using course ID
 * Finds the course in database and fetches playback ID for the first video with muxAssetId
 * @param courseId - The course ID from database
 * @returns Object with playbackId, policy, videoUrl, and assetId, or null if failed
 */
export const fetchPlaybackIdByCourseId = async (
  courseId: string
): Promise<{
  playbackId: string;
  policy: string;
  videoUrl: string;
  assetId: string;
  videoTitle: string;
} | null> => {
  try {
    const CourseModel = (await import("../models/course.model")).default;
    const course = await CourseModel.findById(courseId);

    if (!course) {
      console.error(`Course not found with ID: ${courseId}`);
      return null;
    }

    const courseData = course.courseData as any[];
    const videoWithAsset = courseData.find((item: any) => item.muxAssetId);

    if (!videoWithAsset || !videoWithAsset.muxAssetId) {
      console.error(`No video with muxAssetId found in course ${courseId}`);
      return null;
    }

    const playbackData = await fetchPlaybackIdFromMux(videoWithAsset.muxAssetId);

    if (playbackData) {
      return {
        ...playbackData,
        assetId: videoWithAsset.muxAssetId,
        videoTitle: videoWithAsset.title || "Unknown",
      };
    }

    return null;
  } catch (error: any) {
    console.error(`Failed to fetch playback ID for course ${courseId}:`, error.message);
    return null;
  }
};

