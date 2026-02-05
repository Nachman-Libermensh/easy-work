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
import { formatDuration, formatTime } from "@/src/lib/date-utils";
import { useState, useEffect, useRef } from "react";
import ReactPlayer from "react-player/youtube";

export function MusicFloatingControl() {
  const [mounted, setMounted] = useState(false);
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
    setCurrentTrackProgress,
    setCurrentTrackDuration,
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
  const playerRef = useRef<ReactPlayer>(null);
  const dragControls = useDragControls();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [showVolume, setShowVolume] = useState(false);
  const volumeRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isDraggingSlider) setLocalProgress(currentTrackProgress);
  }, [currentTrackProgress, isDraggingSlider]);

  const track = playlist[currentTrackIndex];
  useEffect(() => {
    if (track) setEditTitle(track.title);
  }, [track]);

  if (!mounted || !playlist.length) return null;

  const handleSeekCommit = (vals: number[]) => {
    const newTime = vals[0];
    setIsDraggingSlider(false);
    if (playerRef.current) playerRef.current.seekTo(newTime, "seconds");
    setCurrentTrackProgress(newTime);
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX className="h-4 w-4" />;
    if (volume < 0.3) return <Volume className="h-4 w-4" />;
    if (volume < 0.7) return <Volume1 className="h-4 w-4" />;
    return <Volume2 className="h-4 w-4" />;
  };

  const videoId = track?.url
    ? track.url.includes("v=")
      ? track.url.split("v=")[1]?.split("&")[0]
      : track.url.split("/").pop()
    : null;
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : null;

  const safeDuration = currentTrackDuration || 0;
  const rawCurrentTime = isDraggingSlider
    ? localProgress
    : currentTrackProgress;
  const safeRemaining = Math.max(safeDuration - rawCurrentTime, 0);

  return (
    <>
      <div className="hidden">
        <ReactPlayer
          ref={playerRef}
          url={track?.url}
          playing={isMusicPlaying}
          volume={volume}
          onDuration={(d) => setCurrentTrackDuration(d)}
          onProgress={(s) => {
            if (!isDraggingSlider) setCurrentTrackProgress(s.playedSeconds);
          }}
          onEnded={nextTrack}
        />
      </div>

      <div
        ref={constraintsRef}
        className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      >
        <motion.div
          drag
          dragListener={false}
          dragControls={dragControls}
          dragMomentum={false}
          dragConstraints={constraintsRef}
          onDragEnd={(_, info) =>
            setMusicWidgetPosition({
              x: musicWidgetPosition.x + info.offset.x,
              y: musicWidgetPosition.y + info.offset.y,
            })
          }
          initial={{ x: musicWidgetPosition.x, y: musicWidgetPosition.y }}
          animate={{ x: musicWidgetPosition.x, y: musicWidgetPosition.y }}
          className={`absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto ${isMusicWidgetMinimized ? "w-auto" : "w-[min(95vw,460px)]"}`}
        >
          {isMusicWidgetMinimized ? (
            <div
              dir="rtl"
              className="flex items-center gap-2 rounded-full border bg-background/95 shadow-xl backdrop-blur-md p-2 pr-4 pl-2"
            >
              <div
                onPointerDown={(e) => dragControls.start(e)}
                className="cursor-grab text-muted-foreground"
              >
                <GripHorizontal className="h-5 w-5 rotate-90" />
              </div>
              <div className="flex items-center gap-3 overflow-hidden max-w-[120px]">
                <div className="relative h-8 w-8 shrink-0 rounded-full overflow-hidden bg-muted border">
                  {thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Music2 className="h-4 w-4 m-auto" />
                  )}
                </div>
                <p className="truncate text-xs font-bold leading-none">
                  {track?.title}
                </p>
              </div>
              <Button
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={isMusicPlaying ? pauseMusic : playMusic}
              >
                {isMusicPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setMusicWidgetMinimized(false)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              dir="rtl"
              className="rounded-xl border bg-background/95 shadow-2xl backdrop-blur-md pt-7 pb-4 px-4 flex flex-col gap-2 relative group overflow-hidden"
            >
              {/* ידית גרירה מקורית */}
              <div
                onPointerDown={(e) => dragControls.start(e)}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-7 bg-muted/50 hover:bg-muted/80 rounded-b-2xl cursor-grab active:cursor-grabbing flex justify-center items-center z-10 border-b border-x border-muted-foreground/10"
              >
                <GripHorizontal className="w-16 h-5 text-muted-foreground/60" />
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 left-2 h-6 w-6 z-20"
                onClick={() => setMusicWidgetMinimized(true)}
              >
                <Minimize2 className="h-3.5 w-3.5" />
              </Button>

              <div className="flex gap-4 items-center mt-3">
                <div className="relative h-20 w-20 shrink-0 rounded-lg overflow-hidden bg-muted border shadow-sm">
                  {thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      className="h-full w-full object-cover"
                      alt=""
                    />
                  ) : (
                    <Music2 className="h-8 w-8 m-auto" />
                  )}
                </div>

                <div className="flex flex-col flex-1 min-w-0 gap-2">
                  {isEditing ? (
                    <div className="flex items-center gap-1 w-full">
                      <Input
                        className="h-7 text-sm px-2 py-0 w-full"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          (updateTrackTitle(track.id, editTitle),
                          setIsEditing(false))
                        }
                        autoFocus
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-green-500"
                        onClick={() => {
                          updateTrackTitle(track.id, editTitle);
                          setIsEditing(false);
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="group/title relative pr-6">
                      <p className="text-sm font-bold leading-tight line-clamp-2">
                        {track?.title}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 h-5 w-5 opacity-0 group-hover/title:opacity-100"
                        onClick={() => setIsEditing(true)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={nextTrack}>
                      <SkipBack className="h-5 w-5 rotate-180" />
                    </Button>
                    <Button
                      size="icon"
                      className="h-10 w-10 rounded-full"
                      onClick={isMusicPlaying ? pauseMusic : playMusic}
                    >
                      {isMusicPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5 ml-0.5" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={previousTrack}>
                      <SkipForward className="h-5 w-5 rotate-180" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="pt-2 mt-1 flex flex-col gap-1 border-t">
                <Slider
                  value={[rawCurrentTime]}
                  max={safeDuration || 100}
                  step={1}
                  onValueChange={(v) => {
                    setIsDraggingSlider(true);
                    setLocalProgress(v[0]);
                  }}
                  onValueCommit={handleSeekCommit}
                />
                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                  <span>-{formatDuration(safeRemaining)}</span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={cycleMusicMode}
                    >
                      {musicMode === "single" ? (
                        <Repeat1 className="h-3.5 w-3.5" />
                      ) : musicMode === "loop-playlist" ? (
                        <Repeat className="h-3.5 w-3.5" />
                      ) : (
                        <ListMusic className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setShowVolume(!showVolume)}
                    >
                      {getVolumeIcon()}
                    </Button>
                  </div>
                  <span>{formatDuration(rawCurrentTime)}</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}
