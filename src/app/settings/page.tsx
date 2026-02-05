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
import { Settings, Bell, Timer, Volume2, Moon, Sun } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { Separator } from "@/src/components/ui/separator";

export default function SettingsPage() {
  const {
    workCycleDuration,
    shortBreakDuration,
    longBreakDuration,
    sessionsBeforeLongBreak,
    setWorkCycleDuration,
    setShortBreakDuration,
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
    <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-5xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" />
          הגדרות מערכת
        </h1>
        <p className="text-muted-foreground">
          התאמה אישית של זמני העבודה, התראות והעדפות שמע.
        </p>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Timer Settings Column */}
        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Timer className="h-5 w-5 text-blue-500" />
                תזמון ומחזורים
              </CardTitle>
              <CardDescription>
                קביעת אורכי הזמן למצבי העבודה וההפסקות השונים.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="work-duration" className="text-base">
                    משך עבודה (דקות)
                  </Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="work-duration"
                      type="number"
                      value={workCycleDuration}
                      onChange={(e) =>
                        setWorkCycleDuration(Number(e.target.value))
                      }
                      min={1}
                      max={120}
                      className="text-lg font-mono md:w-32"
                    />
                    <span className="text-sm text-muted-foreground">
                      מומלץ: 25-50 דקות
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-2">
                  <Label htmlFor="break-duration" className="text-base">
                    הפסקה קצרה (דקות)
                  </Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="break-duration"
                      type="number"
                      value={shortBreakDuration}
                      onChange={(e) =>
                        setShortBreakDuration(Number(e.target.value))
                      }
                      min={1}
                      max={60}
                      className="text-lg font-mono md:w-32"
                    />
                    <span className="text-sm text-muted-foreground">
                      מומלץ: 5-10 דקות
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-2">
                  <Label htmlFor="long-break-duration" className="text-base">
                    הפסקה ארוכה (דקות)
                  </Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="long-break-duration"
                      type="number"
                      value={longBreakDuration}
                      onChange={(e) =>
                        setLongBreakDuration(Number(e.target.value))
                      }
                      min={5}
                      max={120}
                      className="text-lg font-mono md:w-32"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Label
                    htmlFor="sessions-before-long-break"
                    className="mb-2 block"
                  >
                    מספר מחזורים עד הפסקה ארוכה
                  </Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="sessions-before-long-break"
                      type="number"
                      value={sessionsBeforeLongBreak}
                      onChange={(e) =>
                        setSessionsBeforeLongBreak(Number(e.target.value))
                      }
                      min={2}
                      max={10}
                      className="text-lg font-mono md:w-32"
                    />
                    <span className="text-sm text-muted-foreground">
                      הפסקות
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Settings Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Bell className="h-5 w-5 text-yellow-500" />
                התראות
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-2">
                <div className="space-y-1">
                  <Label className="text-base font-medium">התראות דפדפן</Label>
                  <p className="text-sm text-muted-foreground max-w-[250px]">
                    קבלת התראות קופצות בסיום טיימר (גם כשהחלון ממוזער)
                  </p>
                </div>
                <Switch
                  checked={pushEnabled}
                  onCheckedChange={handlePushToggle}
                  className="scale-125 ml-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Volume2 className="h-5 w-5 text-green-500" />
                שמע ומוזיקה
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 py-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base">עוצמת שמע ראשית</Label>
                  <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
                <Slider
                  value={[volume]}
                  max={1}
                  step={0.01}
                  onValueChange={(val) => setVolume(val[0])}
                  className="py-4"
                />
                <p className="text-xs text-muted-foreground">
                  משפיע על עוצמת המוזיקה המובנית במערכת.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
