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
import { formatDuration } from "@/src/lib/date-utils";

const dateKey = (value: Date) =>
  value.toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });

const formatMinutes = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} דק׳`;
  return `${hours} ש׳ ${mins} דק׳`;
};

export function StatsSection() {
  const { shiftHistory, currentShift } = useAppStore(); // Assuming shiftStatus is workStatus

  const stats = useMemo(() => {
    // Combine history with current active shift for accurate "Today" stats
    const allShifts = currentShift
      ? [...shiftHistory, currentShift]
      : shiftHistory;

    // We need to calculate duration for each shift
    // For finished shifts: (end - start)
    // For active shift: (now - start)

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(now);
    const dayIndex = (now.getDay() + 6) % 7;
    startOfWeek.setDate(now.getDate() - dayIndex);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const processedShifts = allShifts.map((shift) => {
      const shiftStart = new Date(shift.start);
      const shiftEnd = shift.end ? new Date(shift.end) : new Date(); // If active, calculate up to now

      let breakDuration = 0;
      shift.breaks.forEach((b) => {
        const bStart = new Date(b.start).getTime();
        const bEnd = b.end ? new Date(b.end).getTime() : new Date().getTime();
        breakDuration += bEnd - bStart;
      });

      const totalDurationMs = shiftEnd.getTime() - shiftStart.getTime();
      const netDurationMinutes = Math.max(
        0,
        (totalDurationMs - breakDuration) / 1000 / 60,
      );

      return {
        date: shiftStart,
        durationMinutes: netDurationMinutes,
      };
    });

    const sumMinutes = (from: Date) =>
      processedShifts
        .filter((entry) => entry.date >= from && entry.date <= now)
        .reduce((total, entry) => total + entry.durationMinutes, 0);

    const dailyMinutes = sumMinutes(startOfDay);
    const weeklyMinutes = sumMinutes(startOfWeek);
    const monthlyMinutes = sumMinutes(startOfMonth);

    const uniqueDays = new Set(
      processedShifts.map((entry) => dateKey(entry.date)),
    );

    // Streak Calculation
    let streak = 0;
    const cursor = new Date(now);

    // Check if today has work. If not, maybe we haven't started yet, so check yesterday to start streak count.
    // If today has work, streak starts from today.
    // However, if I didn't work today YET, my streak from yesterday is still valid until midnight.
    // Let's count backwards.

    // If today is in set, streak = 1 + backwards.
    // If today is NOT in set, check if yesterday is in set. If yes, streak starts from yesterday.

    // Normalize cursor to date only string for check
    if (uniqueDays.has(dateKey(cursor))) {
      // Today is worked
    } else {
      cursor.setDate(cursor.getDate() - 1); // Check yesterday
      if (!uniqueDays.has(dateKey(cursor))) {
        // Neither today nor yesterday
        // Streak is 0 (or keep 0)
      }
    }

    // Now iterate backwards
    if (uniqueDays.has(dateKey(cursor))) {
      while (uniqueDays.has(dateKey(cursor))) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      }
    }

    return {
      dailyMinutes,
      weeklyMinutes,
      monthlyMinutes,
      streak,
      sessionsToday: processedShifts.filter((entry) => entry.date >= startOfDay)
        .length,
    };
  }, [shiftHistory, currentShift]); // Depend on currentShift too

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
              {formatDuration(stats.dailyMinutes)}
            </p>
            <p className="text-xs text-muted-foreground">
              {stats.sessionsToday} מחזורי פוקוס
            </p>
          </div>
          <div className="rounded-lg border p-4 bg-card/50">
            <p className="text-sm text-muted-foreground">שבוע נוכחי</p>
            <p className="text-2xl font-semibold">
              {formatDuration(stats.weeklyMinutes)}
            </p>
            <p className="text-xs text-muted-foreground">
              ממוצע:{" "}
              {formatDuration(
                Math.round(stats.weeklyMinutes / (new Date().getDay() + 1)),
              )}{" "}
              / יום
            </p>
          </div>
          <div className="rounded-lg border p-4 bg-card/50">
            <p className="text-sm text-muted-foreground">חודש נוכחי</p>
            <p className="text-2xl font-semibold">
              {formatDuration(stats.monthlyMinutes)}
            </p>
            <p className="text-xs text-muted-foreground">
              רצף פוקוס: {stats.streak} ימים
            </p>
          </div>
          <div className="rounded-lg border p-4 bg-card/50">
            <p className="text-sm text-muted-foreground">מצב מערכת</p>
            <p className="text-2xl font-semibold">
              {/* We need to get workStatus from store, I used 'shiftStatus' placeholder above, correcting it */}
              <StatusDisplay />
            </p>
            <StatusSubDisplay />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Breaking out to avoid hook issues or just for cleanliness
function StatusDisplay() {
  const { workStatus } = useAppStore();
  return (
    <>
      {workStatus === "working"
        ? "בפוקוס"
        : workStatus === "break"
          ? "בהפסקה"
          : "מוכן להתחלה"}
    </>
  );
}
function StatusSubDisplay() {
  const { workStatus } = useAppStore();
  return (
    <p className="text-xs text-muted-foreground">
      {workStatus === "idle"
        ? "הגדירו את היום בלחיצה אחת"
        : "ממשיכים למחזור הבא"}
    </p>
  );
}
