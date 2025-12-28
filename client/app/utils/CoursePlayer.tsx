import React, { FC, useMemo, useEffect } from "react";
import useSpeechOnHover from "@/app/hooks/useSpeechOnHover";
import MuxPlayer from "@mux/mux-player-react";

type Props = {
  videoId?: string;
  videoUrl?: string;
  title: string;
  userId?: string;
  videoContentId?: string;
};

const CoursePlayer: FC<Props> = ({ videoId, videoUrl, title, userId, videoContentId }) => {
  // Memoize playback config to ensure stable reference and prevent hook order issues
  // According to Mux docs: Use playbackId prop directly with the PLAYBACK_ID from playback_ids array
  // Format: <MuxPlayer playbackId="{PLAYBACK_ID}" />
  const playbackConfig = useMemo(() => {
    // Priority 1: Use videoId as playbackId (backend provides playback ID here)
    // Backend sets: item.videoId = item.playbackId (from playback_ids[0].id)
    if (videoId && typeof videoId === 'string') {
      const trimmed = videoId.trim();
      // Validate: should be a non-empty string, not a URL, reasonable length
      // Mux playback IDs are typically 20-50 characters
      if (trimmed.length > 0 && trimmed.length <= 100 && !trimmed.includes('http') && !trimmed.includes('/')) {
        console.log('CoursePlayer: Using videoId as playbackId:', trimmed);
        return { type: 'playbackId' as const, value: trimmed };
      }
    }
    
    // Priority 2: Extract playback ID from HLS URL
    // Format: https://stream.mux.com/{PLAYBACK_ID}.m3u8
    if (videoUrl && videoUrl.includes('stream.mux.com')) {
      const urlMatch = videoUrl.match(/stream\.mux\.com\/([^.\/]+)/);
      if (urlMatch && urlMatch[1]) {
        const playbackId = urlMatch[1];
        console.log('CoursePlayer: Extracted playbackId from videoUrl:', playbackId);
        return { type: 'playbackId' as const, value: playbackId };
      }
    }
    
    // Priority 3: Fallback to HLS URL as source (not recommended, but works)
    if (videoUrl && videoUrl.includes('.m3u8') && videoUrl.startsWith('http')) {
      console.warn('CoursePlayer: Using HLS URL as source (playbackId preferred):', videoUrl);
      return { type: 'src' as const, value: videoUrl };
    }
    
    return null;
  }, [videoId, videoUrl]);

  // Call hook unconditionally - always at the top level
  const playerRef = useSpeechOnHover<HTMLElement>(`Course video titled ${title}`);

  // Debug logging (can be removed in production)
  useEffect(() => {
    if (!playbackConfig) {
      console.warn('CoursePlayer: No playback config found', { videoId, videoUrl, title });
    } else {
      console.log('CoursePlayer: Using', playbackConfig.type, playbackConfig.value);
    }
  }, [playbackConfig, videoId, videoUrl, title]);

  return (
    <div
      style={{ paddingTop: "56.25%", position: "relative", overflow: "hidden" }}
    >
      {playbackConfig ? (
        <div
          ref={playerRef}
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            height: "100%",
            width: "100%",
          }}
        >
          <MuxPlayer
            {...(playbackConfig.type === 'playbackId' 
              ? { playbackId: playbackConfig.value }
              : { src: playbackConfig.value }
            )}
            metadata={{
              video_id: videoContentId || videoId || playbackConfig.value,
              video_title: title,
              viewer_user_id: userId || "anonymous",
            }}
            streamType="on-demand"
            autoPlay={!!videoId} // Only autoplay for enrolled courses, not demo videos
            playsInline
            onError={(error: any) => {
              console.error('MuxPlayer error:', error);
              console.error('Playback config:', playbackConfig);
              console.error('Props received:', { videoId, videoUrl, title });
              
              // Provide specific error messages
              if (playbackConfig.type === 'playbackId') {
                console.error(`Playback ID "${playbackConfig.value}" is invalid or the video is not accessible.`);
                console.error('Possible reasons:');
                console.error('1. The playback ID is incorrect');
                console.error('2. The video asset is not ready or processed');
                console.error('3. The playback ID policy requires signed tokens');
                console.error('4. The playback ID has been deleted or disabled');
              } else if (playbackConfig.type === 'src') {
                console.error(`HLS URL "${playbackConfig.value}" is invalid or inaccessible.`);
                console.error('Possible reasons:');
                console.error('1. The URL format is incorrect');
                console.error('2. The video asset is not ready or processed');
                console.error('3. CORS or network issues');
              }
            }}
            style={{
              height: "100%",
              width: "100%",
            }}
          />
        </div>
      ) : (
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#000",
            color: "#fff",
          }}
        >
          <p>Video not available. Please check if the video ID is configured correctly.</p>
        </div>
      )}
    </div>
  );
};

export default CoursePlayer;
