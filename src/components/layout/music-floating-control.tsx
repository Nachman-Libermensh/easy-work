"use client";

import { motion } from "framer-motion";
import {
  Pause,
  Play,
  Music2,
  SkipForward,
  SkipBack,
  Repeat,
  Repeat1,
  ListMusic,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Slider } from "@/src/components/ui/slider";
import { useAppStore } from "@/src/store/app-store";
import { formatTime } from "@/src/lib/date-utils";

export function MusicFloatingControl() {
  const {
    isMusicPlaying,
    playMusic,
    pauseMusic,
    nextTrack,
    previousTrack,
    playlist,
    currentTrackIndex,
    currentTrackProgress,
    currentTrackDuration,
    seekTo,
    musicMode,
    cycleMusicMode,
  } = useAppStore();

  const track = playlist[currentTrackIndex];

  // If no track, don't show or show empty state? User said "Card shouldn't disappear... just wait mode".
  // Waiting mode implies there is a player usually. If playlist is empty, maybe hidden.
  if (!playlist.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed bottom-6 left-1/2 z-50 w-[min(95vw,400px)] -translate-x-1/2"
    >
      <div className="rounded-2xl border bg-background/95 shadow-xl backdrop-blur-md p-4 flex flex-col gap-3">
        {/* Track Info & Main Actions */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden flex-1">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${isMusicPlaying ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}
            >
              <Music2 className="h-6 w-6" />
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-xs text-muted-foreground font-medium">
                {isMusicPlaying ? "מנגן כעת" : "בהמתנה"}
              </p>
              <p className="truncate text-sm font-bold text-foreground">
                {track?.title || "ללא שיר"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={previousTrack}
            >
              <SkipBack className="h-5 w-5" />
            </Button>

            <Button
              size="icon"
              className="h-10 w-10 rounded-full shadow-md"
              onClick={isMusicPlaying ? pauseMusic : playMusic}
            >
              {isMusicPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={nextTrack}
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Progress & Lower Controls */}
        <div className="space-y-1.5">
          <Slider
            value={[currentTrackProgress]}
            max={currentTrackDuration || 100}
            step={1}
            onValueChange={(val) => seekTo(val[0])}
            className="w-full cursor-pointer hover:scale-[1.01] transition-transform"
          />
          <div className="flex items-center justify-between text-[10px] text-muted-foreground px-0.5">
            <span>{formatTime(currentTrackProgress)}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className={`h-6 w-6 hover:bg-transparent ${musicMode !== "playlist" ? "text-primary" : "text-muted-foreground"}`}
                onClick={cycleMusicMode}
                title="מצב חזרה"
              >
                {musicMode === "single" && <Repeat1 className="h-3.5 w-3.5" />}
                {musicMode === "loop-playlist" && (
                  <Repeat className="h-3.5 w-3.5" />
                )}
                {musicMode === "playlist" && (
                  <ListMusic className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
            <span>{formatTime(currentTrackDuration)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
