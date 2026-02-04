"use client";

import { motion } from "framer-motion";
import { Music2, Play, Pause, SkipForward } from "lucide-react";
import { useAppStore } from "@/src/store/app-store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";

import { Slider } from "@/src/components/ui/slider";

export function NowPlaying() {
  const {
    playlist,
    currentTrackIndex,
    isMusicPlaying,
    playMusic,
    pauseMusic,
    nextTrack,
    currentTrackProgress,
    currentTrackDuration,
    seekTo,
  } = useAppStore();

  const currentTrack = playlist[currentTrackIndex];

  if (playlist.length === 0) return null;

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = (value: number[]) => {
    seekTo(value[0]);
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full max-w-2xl"
    >
      <Card className="bg-background/40 backdrop-blur-md border-primary/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Music2 className="h-4 w-4" /> עכשיו מתנגן
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col overflow-hidden w-full">
              <span className="truncate font-medium">
                {currentTrack?.title || "טוען..."}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {currentTrack?.url}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <Slider
              value={[currentTrackProgress]}
              max={currentTrackDuration || 100} // prevent 0 max
              step={1}
              onValueChange={handleSeek}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
              <span>{formatTime(currentTrackProgress)}</span>
              <span>{formatTime(currentTrackDuration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button
              size="icon"
              variant="ghost"
              onClick={nextTrack} // Previous track logically? Or just keep simple for now
              className="rounded-full hover:bg-primary/10 hover:text-primary opacity-50 rotate-180"
              aria-label="הקודם"
            >
              <SkipForward className="h-5 w-5" />
            </Button>

            <Button
              size="icon" // Larger play button
              className="h-12 w-12 rounded-full shadow-lg"
              onClick={() => (isMusicPlaying ? pauseMusic() : playMusic())}
              aria-label="נגן או השהה"
            >
              {isMusicPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-1" />
              )}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={nextTrack}
              className="rounded-full hover:bg-primary/10 hover:text-primary"
              aria-label="דלג לשיר הבא"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
