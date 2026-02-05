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
  Volume2,
  VolumeX,
  Volume1,
  Volume,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Slider } from "@/src/components/ui/slider";
import { Input } from "@/src/components/ui/input";
import { useAppStore } from "@/src/store/app-store";
import { formatDuration } from "@/src/lib/date-utils";
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
    isMusicWidgetMinimized,
    setMusicWidgetMinimized,
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
  const volumeRef = useRef<HTMLDivElement>(null);

  // Drag Constraints Ref
  const constraintsRef = useRef(null);

  // Prevent auto-play on mount
  useEffect(() => {
    pauseMusic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close volume when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        volumeRef.current &&
        !volumeRef.current.contains(event.target as Node)
      ) {
        setShowVolume(false);
      }
    }

    if (showVolume) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showVolume]);

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX className="h-4 w-4" />;
    if (volume < 0.3) return <Volume className="h-4 w-4" />;
    if (volume < 0.7) return <Volume1 className="h-4 w-4" />;
    return <Volume2 className="h-4 w-4" />;
  };

  // Sync local progress only when not dragging
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

  // --- חישובי זמן אמינים יותר (Safe Calculations) ---
  const safeDuration = Number(currentTrackDuration) || 0;
  // אם גוררים - מציגים את המיקום המקומי, אחרת את המיקום מהסטור
  const rawCurrentTime = isDraggingSlider
    ? localProgress
    : currentTrackProgress;
  const safeCurrentTime = Number(rawCurrentTime) || 0;
  const safeRemaining = Math.max(safeDuration - safeCurrentTime, 0);

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
        dragElastic={0}
        dragConstraints={constraintsRef}
        onDragEnd={(_, info) => {
          setMusicWidgetPosition({
            x: musicWidgetPosition.x + info.offset.x,
            y: musicWidgetPosition.y + info.offset.y,
          });
        }}
        initial={{ x: musicWidgetPosition.x, y: musicWidgetPosition.y }}
        animate={{
          x: musicWidgetPosition.x,
          y: musicWidgetPosition.y,
          width: isMusicWidgetMinimized ? "auto" : undefined,
        }}
        transition={{
          x: { type: "tween", duration: 0 },
          y: { type: "tween", duration: 0 },
          width: { duration: 0.3, ease: "easeInOut" },
        }}
        style={{ x: musicWidgetPosition.x, y: musicWidgetPosition.y }}
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto ${
          isMusicWidgetMinimized ? "w-auto" : "w-[min(95vw,460px)]"
        }`}
      >
        {isMusicWidgetMinimized ? (
          /* --- MINIMIZED VIEW --- */
          <div
            dir="rtl"
            className="flex items-center gap-2 rounded-full border bg-background/95 shadow-xl backdrop-blur-md p-2 pr-4 pl-2"
          >
            {/* Drag Handle (Minimized) */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
            >
              <GripHorizontal className="h-5 w-5 rotate-90" />
            </div>

            {/* Tiny Details */}
            <div className="flex items-center gap-3 overflow-hidden max-w-[120px]">
              <div className="relative h-8 w-8 shrink-0 rounded-full overflow-hidden bg-muted border">
                {thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbnailUrl}
                    alt="Cover"
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <Music2 className="h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold leading-none">
                  {track?.title || "ללא כותרת"}
                </p>
              </div>
            </div>

            {/* Mini Controls */}
            <div className="flex items-center gap-1 border-r pr-2 mr-1 h-6">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={nextTrack}
                disabled={!hasNext}
              >
                <SkipBack className="h-4 w-4 rotate-180" />
              </Button>
              <Button
                size="icon"
                className="h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={isMusicPlaying ? pauseMusic : playMusic}
              >
                {isMusicPlaying ? (
                  <Pause className="h-4 w-4 fill-current" />
                ) : (
                  <Play className="h-4 w-4 ml-0.5 fill-current" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={previousTrack}
                disabled={!hasPrev}
              >
                <SkipForward className="h-4 w-4 rotate-180" />
              </Button>
            </div>

            {/* Expand Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => setMusicWidgetMinimized(false)}
              title="הרחב"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          /* --- EXPANDED VIEW --- */
          <div
            dir="rtl"
            className="rounded-xl border bg-background/95 shadow-2xl backdrop-blur-md pt-7 pb-4 px-4 flex flex-col gap-2 relative group overflow-hidden"
          >
            {/* --- New Large Top Drag Handle --- */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-6 bg-muted/60 hover:bg-muted/90 rounded-b-2xl cursor-grab active:cursor-grabbing flex justify-center items-center transition-colors z-10 border-b border-x border-muted-foreground/10"
              title="גרור נגן"
            >
              <GripHorizontal className="w-12 h-4 text-muted-foreground/70" />
            </div>

            {/* Minimize Button (Moved to top corner) */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 left-2 h-6 w-6 text-muted-foreground hover:bg-muted/50 rounded-full z-20"
              onClick={() => setMusicWidgetMinimized(true)}
              title="מזער"
            >
              <Minimize2 className="h-3.5 w-3.5" />
            </Button>

            {/* Main Content Grid */}
            <div className="flex gap-4 items-center mt-2">
              {/* Thumbnail */}
              <div className="relative h-20 w-20 shrink-0 rounded-lg overflow-hidden bg-muted border shadow-sm">
                {thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbnailUrl}
                    alt="Cover"
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <Music2
                    className={`h-8 w-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
                      isMusicPlaying
                        ? "text-primary anim-pulse"
                        : "text-muted-foreground"
                    }`}
                  />
                )}
              </div>

              {/* Info & Controls Stack */}
              <div className="flex flex-col flex-1 min-w-0 gap-2">
                {/* Title */}
                <div className="min-w-0">
                  {isEditing ? (
                    <div
                      className="flex items-center gap-1 w-full"
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <Input
                        className="h-7 text-sm px-2 py-0 w-full"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSaveTitle()
                        }
                        autoFocus
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-green-500 shrink-0"
                        onClick={handleSaveTitle}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="group/title relative pr-6">
                      <p
                        className="text-sm font-bold leading-tight line-clamp-2"
                        title={track?.title}
                      >
                        {track?.title || "ללא כותרת"}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 h-5 w-5 opacity-0 group-hover/title:opacity-100 transition-opacity text-muted-foreground -mr-6"
                        onClick={() => setIsEditing(true)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  {/* אורך שיר עליון - מתוקן */}
                  <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                    <span>{formatDuration(safeDuration)}</span>
                    <span className="opacity-50">|</span>
                    <p>{isMusicPlaying ? "מנגן.." : "מושהה"}</p>
                  </div>
                </div>

                {/* Main Controls Row */}
                <div className="flex items-center gap-2 justify-start">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={nextTrack}
                    disabled={!hasNext}
                  >
                    <SkipBack className="h-5 w-5 rotate-180" />
                  </Button>
                  <Button
                    size="icon"
                    className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                    onClick={isMusicPlaying ? pauseMusic : playMusic}
                  >
                    {isMusicPlaying ? (
                      <Pause className="h-5 w-5 fill-current" />
                    ) : (
                      <Play className="h-5 w-5 ml-0.5 fill-current" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={previousTrack}
                    disabled={!hasPrev}
                  >
                    <SkipForward className="h-5 w-5 rotate-180" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Bottom Section: Progress & Extra Controls */}
            <div
              className="pt-2 mt-1 flex flex-col gap-1 border-t"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Slider
                value={[safeCurrentTime]} // שימוש בערך בטוח (מספר)
                max={safeDuration || 100} // מניעת חלוקה ב-0
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

              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                {/* Right side (Start): Time Remaining - מתוקן */}
                <span>-{formatDuration(safeRemaining)}</span>

                <div className="flex items-center gap-1">
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
                    {musicMode === "single" && (
                      <Repeat1 className="h-3.5 w-3.5" />
                    )}
                    {musicMode === "loop-playlist" && (
                      <Repeat className="h-3.5 w-3.5" />
                    )}
                    {musicMode === "playlist" && (
                      <ListMusic className="h-3.5 w-3.5" />
                    )}
                  </Button>

                  {/* Volume Control */}
                  <div className="relative flex justify-center" ref={volumeRef}>
                    {showVolume && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute bottom-full mb-1 bg-popover border rounded-lg p-2 shadow-lg z-20 h-28 flex flex-col items-center"
                      >
                        <Slider
                          orientation="vertical"
                          value={[volume]}
                          max={1}
                          step={0.01}
                          onValueChange={(val) => setVolume(val[0])}
                          className="data-[orientation=vertical]:min-h-24 data-[orientation=vertical]:h-24 cursor-pointer"
                        />
                      </motion.div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-6 w-6 ${
                        showVolume ? "text-primary" : "text-muted-foreground"
                      }`}
                      onClick={() => setShowVolume(!showVolume)}
                    >
                      {getVolumeIcon()}
                    </Button>
                  </div>
                </div>

                {/* Left side (End): Time Elapsed - מתוקן */}
                <span>{formatDuration(safeCurrentTime)}</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
