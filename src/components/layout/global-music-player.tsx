"use client";

import { useEffect, useRef, useState } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import { useAppStore } from "@/src/store/app-store";

export function GlobalMusicPlayer() {
  const {
    playlist,
    currentTrackIndex,
    isMusicPlaying,
    volume,
    nextTrack,
    setProgress,
    seekRequest,
    clearSeekRequest,
  } = useAppStore();

  const [player, setPlayer] = useState<any>(null);
  const [isReady, setIsReady] = useState(false); // דגל נוסף לביטחון
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const currentTrack = playlist[currentTrackIndex];

  // חילוץ ID
  const videoId = currentTrack?.url.includes("v=")
    ? currentTrack.url.split("v=")[1]?.split("&")[0]
    : currentTrack?.url.split("/").pop();

  // טיפול בבקשות דילוג (Scrubbing)
  useEffect(() => {
    if (seekRequest !== null && player && isReady) {
      try {
        player.seekTo(seekRequest, true); // true = allowSeekAhead
        clearSeekRequest();
      } catch (e) {
        console.error("Seek failed", e);
      }
    }
  }, [seekRequest, player, isReady, clearSeekRequest]);

  // סנכרון מצב ניגון - רק כשהנגן באמת מוכן
  useEffect(() => {
    if (!player || !isReady) return;

    try {
      const state = player.getPlayerState();
      if (isMusicPlaying && state !== 1) {
        // 1 = playing
        player.playVideo();
      } else if (!isMusicPlaying && state === 1) {
        player.pauseVideo();
      }
    } catch (e) {
      // כאן אנחנו תופסים את ה-TypeError שראית בלוגים
      console.log("Waiting for YouTube API to stabilize...");
    }
  }, [isMusicPlaying, player, isReady, videoId]);

  // סנכרון ווליום
  useEffect(() => {
    if (player && isReady) {
      try {
        player.setVolume(volume * 100);
      } catch (e) {}
    }
  }, [volume, player, isReady]);

  // טיימר פרוגרס
  useEffect(() => {
    if (isMusicPlaying && player && isReady) {
      progressInterval.current = setInterval(() => {
        try {
          const currentTime = player.getCurrentTime();
          const duration = player.getDuration();
          if (duration > 0) setProgress(currentTime, duration);
        } catch (e) {}
      }, 1000);
    } else {
      if (progressInterval.current) clearInterval(progressInterval.current);
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isMusicPlaying, player, isReady, setProgress]);

  if (!currentTrack) return null;

  const onPlayerReady: YouTubeProps["onReady"] = (event) => {
    setPlayer(event.target);
    setIsReady(true);
    // ווליום התחלתי
    event.target.setVolume(volume * 100);
  };

  return (
    <div
      id="youtube-player-container"
      style={{
        position: "fixed",
        left: "-10000px",
        top: 0,
        pointerEvents: "none", // מונע אינטראקציות בטעות
      }}
    >
      <YouTube
        videoId={videoId}
        opts={{
          height: "200",
          width: "200",
          playerVars: {
            autoplay: 1, // נטפרי לפעמים מחייב אינטראקציה ראשונית, אבל ננסה 1
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            origin: typeof window !== "undefined" ? window.location.origin : "",
          },
        }}
        onReady={onPlayerReady}
        onEnd={() => {
          setIsReady(false); // מאפסים מוכנות לקראת השיר הבא
          nextTrack();
        }}
        onError={(e) => {
          console.error("YouTube Error:", e.data);
          setIsReady(false);
        }}
      />
    </div>
  );
}
