"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/src/store/app-store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Progress } from "@/src/components/ui/progress";
import { Play, Pause, SkipForward, RotateCcw } from "lucide-react";
import ReactPlayer from "react-player";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Home() {
  const {
    workDuration,
    breakDuration,
    timerState,
    timeLeft,
    isActive,
    playlist,
    currentTrackIndex,
    isMusicPlaying,
    pushEnabled,
    volume,
    setTimerState,
    setTimeLeft,
    setIsActive,
    playMusic,
    pauseMusic,
    nextTrack,
  } = useAppStore();

  // Handle Hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const audioRef = useRef<ReactPlayer>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, setTimeLeft]);

  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const handleTimerComplete = () => {
    setIsActive(false);
    playNotificationSound();

    if (pushEnabled) {
      sendPushNotification();
    }

    if (timerState === "work") {
      toast.success("Time for a break!");
      setTimerState("break");
      setTimeLeft(breakDuration * 60);
    } else {
      toast.success("Break over! Get back to work.");
      setTimerState("work");
      setTimeLeft(workDuration * 60);
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio("/notification.mp3");
    // audio.play().catch(e => console.log('Audio play failed', e));
    // Note: User needs to add notification.mp3 to public folder
  };

  const sendPushNotification = () => {
    if (Notification.permission === "granted") {
      new Notification("Easy Work", {
        body: timerState === "work" ? "Time for a break!" : "Back to work!",
      });
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
    if (!isActive && timerState === "idle") {
      setTimerState("work");
      if (timeLeft === 0) setTimeLeft(workDuration * 60);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimerState("idle");
    setTimeLeft(workDuration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!mounted) return null;

  const currentDurationOnTimer =
    timerState === "work" ? workDuration : breakDuration;
  const progress =
    ((currentDurationOnTimer * 60 - timeLeft) / (currentDurationOnTimer * 60)) *
    100;

  const currentTrack = playlist[currentTrackIndex];

  return (
    <div className="flex flex-col gap-6 items-center justify-center h-full relative z-10">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-background/60 backdrop-blur-xl border-primary/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center text-6xl font-mono tabular-nums tracking-widest">
              {formatTime(timeLeft)}
            </CardTitle>
            <CardDescription className="text-center text-lg capitalize font-medium">
              {timerState === "idle"
                ? "Ready to focus?"
                : timerState.replace("-", " ")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="relative pt-2">
              <Progress value={progress} className="h-3" />
            </div>

            <div className="flex justify-center gap-6">
              <Button
                variant={isActive ? "destructive" : "default"}
                size="xl"
                className="w-40 text-lg shadow-lg hover:shadow-xl transition-all"
                onClick={toggleTimer}
              >
                {isActive ? (
                  <Pause className="mr-2 h-6 w-6" />
                ) : (
                  <Play className="mr-2 h-6 w-6" />
                )}
                {isActive ? "Pause" : "Start"}
              </Button>

              <Button
                variant="outline"
                size="xl"
                className="text-lg"
                onClick={resetTimer}
              >
                <RotateCcw className="mr-2 h-6 w-6" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {playlist.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-md"
        >
          <Card className="bg-background/40 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Now Playing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="hidden">
                <ReactPlayer
                  ref={audioRef}
                  url={currentTrack?.url}
                  playing={isMusicPlaying}
                  volume={volume}
                  onEnded={nextTrack}
                  width="0"
                  height="0"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate font-medium">
                    {currentTrack?.title || "No track selected"}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      isMusicPlaying ? pauseMusic() : playMusic()
                    }
                    className="rounded-full"
                  >
                    {isMusicPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={nextTrack}
                    className="rounded-full"
                  >
                    <SkipForward className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
