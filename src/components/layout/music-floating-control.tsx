"use client";

import { motion, useDragControls } from "framer-motion";
import {
  Pause,
  Play,
  Music2,
  SkipForward,
  SkipBack,
  Repeat,
  Repeat1,
  ListMusic,
  GripHorizontal,
  Pencil,
  Check,
  X,
  Volume2,
  VolumeX,
  Volume1,
  Volume,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Slider } from "@/src/components/ui/slider";
import { Input } from "@/src/components/ui/input";
import { useAppStore } from "@/src/store/app-store";
import { formatTime } from "@/src/lib/date-utils";
import { useState, useEffect, useRef } from "react";

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
    musicWidgetPosition,
    setMusicWidgetPosition,
    updateTrackTitle,
    volume,
    setVolume,
  } = useAppStore();

  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);

  // Drag Controls
  const dragControls = useDragControls();

  // Edit Title State
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");

  // Volume State
  const [showVolume, setShowVolume] = useState(false);

  // Drag Constraints Ref
  const constraintsRef = useRef(null);

  // Prevent auto-play on mount
  useEffect(() => {
    pauseMusic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX className="h-4 w-4" />;
    if (volume < 0.3) return <Volume className="h-4 w-4" />;
    if (volume < 0.7) return <Volume1 className="h-4 w-4" />;
    return <Volume2 className="h-4 w-4" />;
  };

  useEffect(() => {
    if (!isDraggingSlider) {
      setLocalProgress(currentTrackProgress);
    }
  }, [currentTrackProgress, isDraggingSlider]);

  const track = playlist[currentTrackIndex];

  useEffect(() => {
    if (track) setEditTitle(track.title);
  }, [track]);

  if (!playlist.length) return null;

  const handleSaveTitle = () => {
    if (track && editTitle.trim()) {
      updateTrackTitle(track.id, editTitle);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(track?.title || "");
    setIsEditing(false);
  };

  const getVideoId = (url: string) => {
    if (!url) return null;
    try {
      if (url.includes("youtu.be/"))
        return url.split("youtu.be/")[1]?.split("?")[0];
      if (url.includes("v=")) return url.split("v=")[1]?.split("&")[0];
      return null;
    } catch {
      return null;
    }
  };

  const videoId = track ? getVideoId(track.url) : null;
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : null;

  const hasNext =
    musicMode === "loop-playlist" || currentTrackIndex < playlist.length - 1;
  const hasPrev = musicMode === "loop-playlist" || currentTrackIndex > 0;

  return (
    <div
      ref={constraintsRef}
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
    >
      <motion.div
        drag
        dragListener={false}
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0.05}
        dragConstraints={constraintsRef}
        onDragEnd={(_, info) => {
          setMusicWidgetPosition({
            x: musicWidgetPosition.x + info.offset.x,
            y: musicWidgetPosition.y + info.offset.y,
          });
        }}
        initial={{ x: musicWidgetPosition.x, y: musicWidgetPosition.y }}
        animate={{ x: musicWidgetPosition.x, y: musicWidgetPosition.y }}
        style={{ x: musicWidgetPosition.x, y: musicWidgetPosition.y }}
        // שינוי רוחב כאן: הגדלתי מ-420px ל-500px
        className="absolute bottom-6 left-1/2 w-[min(95vw,500px)] -translate-x-1/2 pointer-events-auto"
      >
        <div
          dir="rtl"
          className="rounded-2xl border bg-background/95 shadow-2xl backdrop-blur-md p-5 pb-3 flex flex-col gap-2 relative group"
        >
          {/* Grip Icon - הוגדל והורחב */}
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className="absolute top-0 left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing hover:bg-muted/80 bg-muted/40 transition-colors rounded-b-2xl w-36 h-6 flex justify-center items-center z-10 border-b border-x border-border/40 shadow-sm"
            title="גרור נגן"
          >
            <GripHorizontal className="w-8 h-4 text-muted-foreground/70" />
          </div>

          {/* Top Row: Info & Controls */}
          <div className="flex items-start justify-between gap-4 pt-4">
            {/* Left Side: Thumbnail & Text */}
            <div className="flex gap-4 overflow-hidden flex-1 selection:bg-transparent min-w-0">
              {/* Thumbnail */}
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-muted border shadow-sm mt-1">
                {thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbnailUrl}
                    alt={track?.title || "תמונת שיר"}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <Music2
                    className={`h-8 w-8 ${
                      isMusicPlaying
                        ? "text-primary anim-pulse"
                        : "text-muted-foreground"
                    }`}
                  />
                )}
              </div>

              {/* Title Section */}
              <div className="flex flex-col flex-1 min-w-0 justify-center">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    {isMusicPlaying ? "מנגן כעת" : "מושהה"}
                  </p>
                </div>

                {isEditing ? (
                  <div className="flex items-center gap-1 w-full">
                    <Input
                      className="h-8 text-sm px-2 py-0 w-full"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                      autoFocus
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-green-500 shrink-0"
                      onClick={handleSaveTitle}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-500 shrink-0"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="group/title w-full relative">
                    <p
                      className="text-lg font-bold text-foreground leading-tight cursor-help break-words line-clamp-2 pr-6"
                      title={track?.title}
                      onDoubleClick={() => setIsEditing(true)}
                    >
                      {track?.title || "ללא כותרת"}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 left-0 h-6 w-6 opacity-0 group-hover/title:opacity-100 transition-opacity text-muted-foreground"
                      onClick={() => setIsEditing(true)}
                      title="ערוך שם"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Volume Control */}
            <div className="relative flex flex-col items-center justify-end h-full gap-2 pl-1">
              <div className="relative flex flex-col items-center justify-center">
                {/* Expandable Vertical Slider - תוקן המיקום והעיצוב */}
                {showVolume && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-popover border border-border rounded-full p-3 shadow-xl z-20 flex flex-col items-center justify-center w-12 h-36"
                  >
                    <Slider
                      orientation="vertical"
                      value={[volume]}
                      max={1}
                      step={0.01}
                      onValueChange={(val) => setVolume(val[0])}
                      className="data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-32 py-1"
                    />
                  </motion.div>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-9 w-9 hover:bg-muted rounded-full transition-colors ${
                    showVolume
                      ? "text-primary bg-muted"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setShowVolume(!showVolume)}
                  title="עוצמת שמע"
                >
                  {getVolumeIcon()}
                </Button>
              </div>
            </div>
          </div>

          {/* Middle: Main Controls */}
          <div className="flex items-center justify-center gap-6 py-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-muted-foreground hover:text-foreground disabled:opacity-30"
              onClick={previousTrack}
              disabled={!hasPrev}
              title="השיר הקודם"
            >
              <SkipForward className="h-6 w-6 rotate-180" />
            </Button>

            <Button
              size="icon"
              className="h-16 w-16 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all shadow-primary/20"
              onClick={isMusicPlaying ? pauseMusic : playMusic}
            >
              {isMusicPlaying ? (
                <Pause className="h-8 w-8 fill-current" />
              ) : (
                <Play className="h-8 w-8 ml-1 fill-current" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-muted-foreground hover:text-foreground disabled:opacity-30"
              onClick={nextTrack}
              disabled={!hasNext}
              title="השיר הבא"
            >
              <SkipBack className="h-6 w-6 rotate-180" />
            </Button>
          </div>

          {/* Bottom: Progress Bar */}
          <div className="space-y-2 pt-2 border-t mt-1">
            <Slider
              value={[isDraggingSlider ? localProgress : currentTrackProgress]}
              max={currentTrackDuration || 100}
              step={1}
              onValueChange={(vals) => {
                setIsDraggingSlider(true);
                setLocalProgress(vals[0]);
              }}
              onValueCommit={(vals) => {
                seekTo(vals[0]);
                setIsDraggingSlider(false);
              }}
              className="w-full cursor-pointer hover:scale-[1.01] transition-transform py-2"
            />

            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono px-1">
              <span>
                {formatTime(
                  isDraggingSlider ? localProgress : currentTrackProgress,
                )}
              </span>

              <Button
                variant="ghost"
                size="icon"
                className={`h-6 w-6 hover:bg-transparent ${
                  musicMode !== "playlist"
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
                onClick={cycleMusicMode}
                title="מצב חזרה"
              >
                {musicMode === "single" && <Repeat1 className="h-4 w-4" />}
                {musicMode === "loop-playlist" && (
                  <Repeat className="h-4 w-4" />
                )}
                {musicMode === "playlist" && <ListMusic className="h-4 w-4" />}
              </Button>

              <span>{formatTime(currentTrackDuration)}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
