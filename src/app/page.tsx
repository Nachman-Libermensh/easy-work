"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
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
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  CalendarCheck,
  LineChart,
  Music2,
  Settings,
} from "lucide-react";
import ReactPlayer from "react-player";
import { toast } from "sonner";
import { motion } from "framer-motion";

const dateKey = (value: Date) =>
  value.toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });

const formatMinutes = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} דק׳`;
  return `${hours} ש׳ ${mins} דק׳`;
};

export default function Home() {
  const {
    workDuration,
    breakDuration,
    longBreakDuration,
    sessionsBeforeLongBreak,
    timerState,
    timeLeft,
    isActive,
    currSession,
    playlist,
    currentTrackIndex,
    isMusicPlaying,
    pushEnabled,
    volume,
    workLog,
    setTimerState,
    setTimeLeft,
    setIsActive,
    setCurrSession,
    incrementSession,
    addWorkLog,
    playMusic,
    pauseMusic,
    nextTrack,
  } = useAppStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const audioRef = useRef<ReactPlayer>(null);

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
  }, [isActive, timeLeft, setTimeLeft]);

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

  const stats = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(now);
    const dayIndex = (now.getDay() + 6) % 7;
    startOfWeek.setDate(now.getDate() - dayIndex);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const entries = workLog.map((entry) => ({
      ...entry,
      date: new Date(entry.startedAt),
    }));

    const sumMinutes = (from: Date) =>
      entries
        .filter((entry) => entry.date >= from && entry.date <= now)
        .reduce((total, entry) => total + entry.durationMinutes, 0);

    const dailyMinutes = sumMinutes(startOfDay);
    const weeklyMinutes = sumMinutes(startOfWeek);
    const monthlyMinutes = sumMinutes(startOfMonth);

    const uniqueDays = new Set(entries.map((entry) => dateKey(entry.date)));
    let streak = 0;
    const cursor = new Date(now);
    while (uniqueDays.has(dateKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return {
      dailyMinutes,
      weeklyMinutes,
      monthlyMinutes,
      streak,
      sessionsToday: entries.filter((entry) => entry.date >= startOfDay).length,
    };
  }, [workLog]);

  if (!mounted) return null;

  const currentDurationOnTimer =
    timerState === "work"
      ? workDuration
      : timerState === "long-break"
        ? longBreakDuration
        : breakDuration;
  const progress =
    ((currentDurationOnTimer * 60 - timeLeft) / (currentDurationOnTimer * 60)) *
    100;

  const currentTrack = playlist[currentTrackIndex];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">לוח עבודה יומי</h1>
        <p className="text-muted-foreground">
          הגדירו את מחזורי הפוקוס שלכם, הפעילו מוזיקה מרגיעה ועקבו אחרי ההתקדמות
          בזמן אמת.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="bg-background/60 backdrop-blur-xl border-primary/20 shadow-2xl">
            <CardHeader className="space-y-3">
              <CardTitle className="text-center text-6xl font-mono tabular-nums tracking-widest">
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
                  size="xl"
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
                  size="xl"
                  className="text-lg"
                  onClick={resetTimer}
                >
                  <RotateCcw className="mr-2 h-6 w-6" />
                  איפוס
                </Button>

                <Button
                  variant="secondary"
                  size="xl"
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

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" /> סטטיסטיקות
              </CardTitle>
              <CardDescription>תמונה מהירה של ההתקדמות שלכם</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">היום</p>
                  <p className="text-2xl font-semibold">
                    {formatMinutes(stats.dailyMinutes)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.sessionsToday} מחזורי פוקוס
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">שבוע נוכחי</p>
                  <p className="text-2xl font-semibold">
                    {formatMinutes(stats.weeklyMinutes)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ממוצע יומי: {formatMinutes(Math.round(stats.weeklyMinutes / 7))}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">חודש נוכחי</p>
                  <p className="text-2xl font-semibold">
                    {formatMinutes(stats.monthlyMinutes)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    רצף פוקוס: {stats.streak} ימים
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">מצב מערכת</p>
                  <p className="text-2xl font-semibold">
                    {isActive ? "בפוקוס" : "מוכן להתחלה"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {timerState === "idle"
                      ? "הגדירו את היום בלחיצה אחת"
                      : "ממשיכים למחזור הבא"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" /> מחזור עבודה מהיר
              </CardTitle>
              <CardDescription>
                קפיצה מהירה לעדכון אורכי המחזורים בהגדרות
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>עבודה</span>
                <span className="font-medium">{workDuration} דק׳</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>הפסקה קצרה</span>
                <span className="font-medium">{breakDuration} דק׳</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>הפסקה ארוכה</span>
                <span className="font-medium">{longBreakDuration} דק׳</span>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/settings">לעריכת הגדרות</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {playlist.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-2xl"
        >
          <Card className="bg-background/40 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Music2 className="h-4 w-4" /> עכשיו מתנגן
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
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate font-medium">
                    {currentTrack?.title || "לא נבחר שיר"}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {currentTrack?.url}
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
                    aria-label="נגן או השהה"
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
                    aria-label="דלג לשיר הבא"
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
