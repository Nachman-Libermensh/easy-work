"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Progress } from "@/src/components/ui/progress";
import { Play, Pause, RotateCcw, CalendarCheck } from "lucide-react";
import { useAppStore } from "@/src/store/app-store";
import { toast } from "sonner";

export function TimerSection() {
  const {
    workDuration,
    breakDuration,
    longBreakDuration,
    sessionsBeforeLongBreak,
    timerState,
    timeLeft,
    isActive,
    currSession,
    pushEnabled,
    setTimerState,
    setTimeLeft,
    setIsActive,
    setCurrSession,
    incrementSession,
    addWorkLog,
  } = useAppStore();

  // Remove mounted state and effect; use typeof window !== "undefined" for client-only rendering if needed

  const playNotificationSound = () => {
    const audio = new Audio("/notification.mp3");
    audio.play().catch(() => undefined);
  };

  const sendPushNotification = () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification("Easy Work", {
        body: timerState === "work" ? "זמן להפסקה" : "חזרה לעבודה",
      });
    }
  };

  const handleTimerComplete = () => {
    setIsActive(false);
    playNotificationSound();

    if (pushEnabled) {
      sendPushNotification();
    }

    if (timerState === "work") {
      const nextSession = currSession + 1;
      addWorkLog(workDuration);
      incrementSession();

      const shouldLongBreak = nextSession >= sessionsBeforeLongBreak;
      toast.success(shouldLongBreak ? "זמן להפסקה ארוכה" : "זמן להפסקה קצרה");

      if (shouldLongBreak) {
        setTimerState("long-break");
        setTimeLeft(longBreakDuration * 60);
        setCurrSession(0);
      } else {
        setTimerState("break");
        setTimeLeft(breakDuration * 60);
      }
    } else {
      toast.success("הפסקה הסתיימה, חוזרים לפוקוס");
      setTimerState("work");
      setTimeLeft(workDuration * 60);
    }
  };

  useEffect(() => {
    if (timerState === "idle" && !isActive) {
      setTimeLeft(workDuration * 60);
    }
  }, [timerState, isActive, workDuration, setTimeLeft]);

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
  }, [isActive, timeLeft, setTimeLeft]); // Removed handleTimerComplete from deps to simple functions or stable refs

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
    setCurrSession(0);
  };

  const startWorkday = () => {
    setTimerState("work");
    setTimeLeft(workDuration * 60);
    setIsActive(true);
    setCurrSession(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (typeof window === "undefined") return null;

  const currentDurationOnTimer =
    timerState === "work"
      ? workDuration
      : timerState === "long-break"
        ? longBreakDuration
        : breakDuration;

  // Prevent division by zero if duration is somehow 0
  const safeDuration = currentDurationOnTimer * 60 || 1;
  const progress = ((safeDuration - timeLeft) / safeDuration) * 100;

  return (
    <motion.div
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-background/60 backdrop-blur-xl border-primary/20 shadow-2xl h-full">
        <CardHeader className="space-y-3">
          <CardTitle className="text-center text-6xl font-mono tabular-nums tracking-widest text-foreground">
            {formatTime(timeLeft)}
          </CardTitle>
          <CardDescription className="text-center text-lg font-medium">
            {timerState === "idle"
              ? "מוכנים לפוקוס?"
              : timerState === "work"
                ? "פוקוס בעבודה"
                : timerState === "long-break"
                  ? "הפסקה ארוכה"
                  : "הפסקה קצרה"}
          </CardDescription>
          <div className="text-center text-sm text-muted-foreground">
            סשן {currSession + 1} מתוך {sessionsBeforeLongBreak}
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="relative pt-2">
            <Progress value={progress} className="h-3" />
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant={isActive ? "destructive" : "default"}
              size="lg"
              className="w-40 text-lg shadow-lg hover:shadow-xl transition-all"
              onClick={toggleTimer}
            >
              {isActive ? (
                <Pause className="mr-2 h-6 w-6" />
              ) : (
                <Play className="mr-2 h-6 w-6" />
              )}
              {isActive ? "עצירה" : "התחלה"}
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="text-lg"
              onClick={resetTimer}
            >
              <RotateCcw className="mr-2 h-6 w-6" />
              איפוס
            </Button>

            <Button
              variant="secondary"
              size="lg"
              className="text-lg"
              onClick={startWorkday}
            >
              <CalendarCheck className="mr-2 h-6 w-6" />
              התחלת יום
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
