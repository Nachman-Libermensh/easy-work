"use client";

import { useAppStore } from "@/src/store/app-store";
import { useEffect, useState } from "react";

export function GlobalMusicPlayer() {
  const { playlist, currentTrackIndex, isMusicPlaying, nextTrack } =
    useAppStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !playlist[currentTrackIndex]) return null;

  const currentTrack = playlist[currentTrackIndex];

  // חילוץ ה-ID מה-URL (פשוט ובסיסי)
  const videoId = currentTrack.url.includes("v=")
    ? currentTrack.url.split("v=")[1]?.split("&")[0]
    : currentTrack.url.split("/").pop();

  // בניית ה-URL ל-Embed עם הפרמטרים של יוטיוב
  // autoplay=1 ינסה לנגן, אבל הדפדפן עשוי לחסום עד שתלחץ
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${isMusicPlaying ? 1 : 0}&enablejsapi=1`;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 9999,
        width: "300px",
        height: "170px",
        background: "#000",
        borderRadius: "12px",
        overflow: "hidden",
        border: "2px solid #3b82f6", // מסגרת כחולה בולטת שתדע שזה זה
      }}
    >
      <iframe
        width="100%"
        height="100%"
        src={embedUrl}
        title="YouTube music player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    </div>
  );
}
