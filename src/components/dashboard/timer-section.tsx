"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Play, Pause, Coffee, LogOut, CheckCircle2 } from "lucide-react";
import { useAppStore } from "@/src/store/app-store";
import { toast } from "sonner";

export function TimerSection() {
  const {
    workStatus,
    startWork,
    startBreak,
    stopWork,
    lastStateChange,
    currentShift,
    workCycleDuration,
    pushEnabled,
  } = useAppStore();

  const [elapsed, setElapsed] = useState(0);

  // Sound & Notification Logic
  const playNotificationSound = () => {
    const audio = new Audio("/notification.mp3");
    audio.play().catch(() => undefined);
  };

  const sendPushNotification = (msg: string) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "granted" && pushEnabled) {
      new Notification("Easy Work", { body: msg });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!lastStateChange) {
        setElapsed(0);
        return;
      }

      const start = new Date(lastStateChange).getTime();
      const now = new Date().getTime();
      const diffInSeconds = Math.floor((now - start) / 1000);
      setElapsed(diffInSeconds);

      // Check for Break Alert
      if (
        workStatus === "working" &&
        diffInSeconds === workCycleDuration * 60
      ) {
        playNotificationSound();
        sendPushNotification(`עבדת כבר ${workCycleDuration} דקות! זמן להפסקה?`);
        toast.info("זמן מומלץ להפסקה", {
          description: `עברו ${workCycleDuration} דקות של עבודה רצופה`,
          action: {
            label: "צא להפסקה",
            onClick: startBreak,
          },
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastStateChange, workStatus, workCycleDuration, pushEnabled, startBreak]);

  const handleStartWork = () => {
    startWork();
    toast.success("יום עבודה התחיל בהצלחה!");
  };

  const handleBreak = () => {
    startBreak();
    toast.success("יצאת להפסקה");
  };

  const handleReturn = () => {
    startWork(); // Resume work
    toast.success("חזרה לעבודה");
  };

  const handleEndShift = () => {
    stopWork();
    toast.success("יום העבודה הסתיים");
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          {workStatus === "working" && (
            <Play className="h-5 w-5 text-primary" />
          )}
          {workStatus === "break" && (
            <Coffee className="h-5 w-5 text-orange-500" />
          )}
          {workStatus === "idle" && (
            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
          )}
          סטטוס עבודה
        </CardTitle>
        <CardDescription>
          {workStatus === "idle" && "מוכן להתחיל יום חדש?"}
          {workStatus === "working" && "במצב עבודה פעיל"}
          {workStatus === "break" && "בהפסקה"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6 py-4">
          {/* Timer Display */}
          <div className="text-6xl font-mono font-bold tracking-tighter text-foreground tabular-nums">
            {workStatus === "idle" ? "00:00:00" : formatTime(elapsed)}
          </div>

          {/* Controls */}
          <div className="flex w-full gap-4 justify-center">
            {workStatus === "idle" && (
              <Button
                size="lg"
                className="w-full max-w-xs text-lg h-12"
                onClick={handleStartWork}
              >
                <Play className="mr-2 h-5 w-5" /> התחל עבודה
              </Button>
            )}

            {workStatus === "working" && (
              <>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 max-w-[160px] h-12 text-lg border-orange-200 hover:bg-orange-50 text-orange-700"
                  onClick={handleBreak}
                >
                  <Coffee className="mr-2 h-5 w-5" /> הפסקה
                </Button>
                <Button
                  size="lg"
                  variant="destructive"
                  className="flex-1 max-w-[160px] h-12 text-lg"
                  onClick={handleEndShift}
                >
                  <LogOut className="mr-2 h-5 w-5" /> סיים יום
                </Button>
              </>
            )}

            {workStatus === "break" && (
              <Button
                size="lg"
                className="w-full max-w-xs text-lg h-12"
                onClick={handleReturn}
              >
                <Play className="mr-2 h-5 w-5" /> חזור לעבודה
              </Button>
            )}
          </div>

          {/* Shift Info */}
          {currentShift?.start && (
            <div className="text-sm text-muted-foreground mt-2">
              התחלת ב:{" "}
              {new Date(currentShift.start).toLocaleTimeString("he-IL", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
