"use client";

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
import { Settings } from "lucide-react";

export function QuickSettings() {
  const { workCycleDuration, shortBreakDuration, longBreakDuration } =
    useAppStore();

  return (
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
          <span className="font-medium">{workCycleDuration} דק׳</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>הפסקה קצרה</span>
          <span className="font-medium">{shortBreakDuration} דק׳</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>הפסקה ארוכה</span>
          <span className="font-medium">{longBreakDuration} דק׳</span>
        </div>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/settings">לעריכת הגדרות</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
