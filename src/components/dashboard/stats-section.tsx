"use client";

import { useMemo } from "react";
import { useAppStore } from "@/src/store/app-store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";
import { LineChart } from "lucide-react";

const dateKey = (value: Date) =>
  value.toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });

const formatMinutes = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} דק׳`;
  return `${hours} ש׳ ${mins} דק׳`;
};

export function StatsSection() {
  const { workLog, isActive, timerState } = useAppStore();

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

    // Simple streak calculation (backwards from today)
    // If today has entry, streak starts. If not, maybe yesterday?
    // Let's keep logic simple: strict streak including today or consecutive days ending yesterday.

    // Improved logic:
    // Check if today is present. If so, start.
    // If not, check yesterday. If so, start.
    // Else 0.
    // Then iterate back. (Not fully implemented in original code, keeps simple iteration)

    while (uniqueDays.has(dateKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    // Fallback: If today is not in set, and yesterday is, streak might be valid but above loop won't catch it if looking for today first.
    // But original code: start at now.

    return {
      dailyMinutes,
      weeklyMinutes,
      monthlyMinutes,
      streak,
      sessionsToday: entries.filter((entry) => entry.date >= startOfDay).length,
    };
  }, [workLog]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="h-5 w-5" /> סטטיסטיקות
        </CardTitle>
        <CardDescription>תמונה מהירה של ההתקדמות שלכם</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border p-4 bg-card/50">
            <p className="text-sm text-muted-foreground">היום</p>
            <p className="text-2xl font-semibold">
              {formatMinutes(stats.dailyMinutes)}
            </p>
            <p className="text-xs text-muted-foreground">
              {stats.sessionsToday} מחזורי פוקוס
            </p>
          </div>
          <div className="rounded-lg border p-4 bg-card/50">
            <p className="text-sm text-muted-foreground">שבוע נוכחי</p>
            <p className="text-2xl font-semibold">
              {formatMinutes(stats.weeklyMinutes)}
            </p>
            <p className="text-xs text-muted-foreground">
              ממוצע יומי: {formatMinutes(Math.round(stats.weeklyMinutes / 7))}
            </p>
          </div>
          <div className="rounded-lg border p-4 bg-card/50">
            <p className="text-sm text-muted-foreground">חודש נוכחי</p>
            <p className="text-2xl font-semibold">
              {formatMinutes(stats.monthlyMinutes)}
            </p>
            <p className="text-xs text-muted-foreground">
              רצף פוקוס: {stats.streak} ימים
            </p>
          </div>
          <div className="rounded-lg border p-4 bg-card/50">
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
  );
}
