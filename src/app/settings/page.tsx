"use client";

import { useAppStore } from "@/src/store/app-store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Switch } from "@/src/components/ui/switch";
import { Slider } from "@/src/components/ui/slider";
import { Settings, Bell, Timer, Volume2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const {
    workDuration,
    breakDuration,
    longBreakDuration,
    sessionsBeforeLongBreak,
    setWorkDuration,
    setBreakDuration,
    setLongBreakDuration,
    setSessionsBeforeLongBreak,
    pushEnabled,
    togglePush,
    volume,
    setVolume,
  } = useAppStore();

  const handlePushToggle = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (!pushEnabled && Notification.permission !== "granted") {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          toast.error("אין הרשאה להתראות בדפדפן");
          return;
        }
      }
    }
    togglePush();
  };

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (pushEnabled && Notification.permission === "denied") {
      toast.warning("חסמת הרשאות התראה בדפדפן");
    }
  }, [pushEnabled]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">הגדרות</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" /> תזמון עבודה
          </CardTitle>
          <CardDescription>
            התאמה אישית של מחזורי עבודה והפסקה
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="work-duration">משך עבודה (בדקות)</Label>
              <Input
                id="work-duration"
                type="number"
                value={workDuration}
                onChange={(e) => setWorkDuration(Number(e.target.value))}
                min={1}
                max={120}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="break-duration">משך הפסקה (בדקות)</Label>
              <Input
                id="break-duration"
                type="number"
                value={breakDuration}
                onChange={(e) => setBreakDuration(Number(e.target.value))}
                min={1}
                max={60}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="long-break-duration">הפסקה ארוכה (בדקות)</Label>
              <Input
                id="long-break-duration"
                type="number"
                value={longBreakDuration}
                onChange={(e) => setLongBreakDuration(Number(e.target.value))}
                min={5}
                max={120}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sessions-before-long-break">
                סשנים עד הפסקה ארוכה
              </Label>
              <Input
                id="sessions-before-long-break"
                type="number"
                value={sessionsBeforeLongBreak}
                onChange={(e) =>
                  setSessionsBeforeLongBreak(Number(e.target.value))
                }
                min={2}
                max={10}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" /> התראות
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">התראות בדפדפן</Label>
              <p className="text-sm text-muted-foreground">
                קבלת התראה בסיום מחזור העבודה או ההפסקה
              </p>
            </div>
            <Switch checked={pushEnabled} onCheckedChange={handlePushToggle} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" /> שמע
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>עוצמת מוזיקה</Label>
              <span className="text-sm text-muted-foreground">
                {Math.round(volume * 100)}%
              </span>
            </div>
            <Slider
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={(val) => setVolume(val[0])}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
