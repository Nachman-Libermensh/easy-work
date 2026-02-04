"use client";

import { useEffect, useState, useRef } from "react";
import ReactPlayer from "react-player";
import { useAppStore } from "@/src/store/app-store";
import { getYoutubeTitle } from "@/src/app/actions/get-youtube-title";

export function GlobalMusicPlayer() {
  const {
    playlist,
    currentTrackIndex,
    isMusicPlaying,
    volume,
    nextTrack,
    updateTrackTitle,
    musicMode,
    seekRequest,
    clearSeekRequest,
    setProgress,
  } = useAppStore();

  const [mounted, setMounted] = useState(false);
  const playerRef = useRef<any>(null); // Ref for calling seek methods

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTrack = playlist[currentTrackIndex];

  // Title fetching logic
  useEffect(() => {
    if (!currentTrack) return;

    // If we have a URL but title is default/auto, try to fetch real title
    if (currentTrack.isAutoTitle && currentTrack.url) {
      getYoutubeTitle(currentTrack.url).then((fetchedTitle) => {
        if (fetchedTitle) {
          updateTrackTitle(currentTrack.id, fetchedTitle);
        }
      });
    }
  }, [currentTrack?.id, currentTrack?.url, currentTrack?.isAutoTitle]);

  // Handle seekingSAFE
  useEffect(() => {
    if (
      seekRequest !== null &&
      playerRef.current &&
      typeof playerRef.current.seekTo === "function"
    ) {
      playerRef.current.seekTo(seekRequest);
      clearSeekRequest();
    }
  }, [seekRequest, clearSeekRequest]);

  if (!mounted || !currentTrack) return null;

  // Determine looping behavior
  const shouldLoop =
    musicMode === "single" ||
    (musicMode === "playlist" && playlist.length === 1);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        opacity: 0.01,
        pointerEvents: "none",
        zIndex: -1,
        width: "1px",
        height: "1px",
        overflow: "hidden",
      }}
    >
      <ReactPlayer
        ref={playerRef}
        key={currentTrack.id}
        url={currentTrack.url}
        playing={isMusicPlaying}
        volume={volume}
        loop={shouldLoop}
        onEnded={nextTrack}
        onProgress={(state: any) =>
          setProgress(
            state.playedSeconds,
            playerRef.current?.getDuration
              ? playerRef.current.getDuration() || 0
              : 0,
          )
        }
        onReady={() => {
          if (playerRef.current?.getDuration) {
            setProgress(0, playerRef.current.getDuration());
          }
        }}
        width="100%"
        height="100%"
        playsinline
        config={{
          youtube: {
            playerVars: {
              origin:
                typeof window !== "undefined"
                  ? window.location.origin
                  : undefined,
              playsinline: 1,
            },
          } as any,
        }}
      />
    </div>
  );
}
