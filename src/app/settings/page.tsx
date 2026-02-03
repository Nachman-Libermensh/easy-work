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
import { Separator } from "@/src/components/ui/separator";

export default function SettingsPage() {
  const {
    workDuration,
    breakDuration,
    setWorkDuration,
    setBreakDuration,
    pushEnabled,
    togglePush,
    volume,
    setVolume,
  } = useAppStore();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" /> Timer Configuration
          </CardTitle>
          <CardDescription>
            Customize your work and break intervals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="work-duration">Work Duration (minutes)</Label>
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
              <Label htmlFor="break-duration">Break Duration (minutes)</Label>
              <Input
                id="break-duration"
                type="number"
                value={breakDuration}
                onChange={(e) => setBreakDuration(Number(e.target.value))}
                min={1}
                max={60}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" /> Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive browser notifications when timer ends
              </p>
            </div>
            <Switch checked={pushEnabled} onCheckedChange={togglePush} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" /> Sound
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>Music Volume</Label>
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
