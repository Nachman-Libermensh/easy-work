"use client";

import { useMemo } from "react";
import { useAppStore, Shift, BreakSession } from "@/src/store/app-store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { AlertCircle, CheckCircle2, History } from "lucide-react";

function calculateDuration(start: string, end?: string): number {
  // minutes
  if (!end) return 0;
  return (new Date(end).getTime() - new Date(start).getTime()) / 1000 / 60;
}

export function WorkHistory() {
  const { shiftHistory, workCycleDuration, shortBreakDuration } = useAppStore();

  const historyData = useMemo(() => {
    return shiftHistory
      .map((shift) => {
        const totalDuration = calculateDuration(shift.start, shift.end);

        let totalBreakTime = 0;
        shift.breaks.forEach((b) => {
          totalBreakTime += calculateDuration(b.start, b.end);
        });

        const netWorkTime = totalDuration - totalBreakTime;

        // Compliance Logic
        // Goal: 1 break (shortBreakDuration) every (workCycleDuration).
        const expectedBreaks = Math.floor(netWorkTime / workCycleDuration);
        const actualBreaks = shift.breaks.length;

        // Strict compliance: Did they take enough breaks?
        // Let's be lenient: Work time / Break time ratio?
        // User asked: "Did they meet the goal of 5 min break every hour".

        const isCompliant = actualBreaks >= expectedBreaks;
        // Or if total break time is sufficient?
        // Let's stick to "Count" or "Total Time".
        // Simple heuristic:

        return {
          ...shift,
          netWorkTime,
          totalBreakTime,
          status: isCompliant ? "takin" : "hariga",
        };
      })
      .sort(
        (a, b) => new Date(b.start).getTime() - new Date(a.start).getTime(),
      );
  }, [shiftHistory, workCycleDuration]);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("he-IL");
  };

  const formatDurationDisplay = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = Math.floor(mins % 60);
    return h > 0 ? `${h} ש' ו-${m} דק'` : `${m} דק'`;
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          היסטוריית עבודה
        </CardTitle>
        <CardDescription>
          סיכום משמרות, הפסקות ועמידה ביעדים ({shortBreakDuration} דקות הפסקה כל{" "}
          {workCycleDuration} דקות עבודה)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">תאריך</TableHead>
                <TableHead className="text-right">התחלה</TableHead>
                <TableHead className="text-right">סיום</TableHead>
                <TableHead className="text-right">נטו עבודה</TableHead>
                <TableHead className="text-right">זמן הפסקה</TableHead>
                <TableHead className="text-right">סטטוס</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyData.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center h-24 text-muted-foreground"
                  >
                    אין נתונים להצגה עדיין
                  </TableCell>
                </TableRow>
              )}
              {historyData.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell className="font-medium">
                    {formatDate(shift.start)}
                  </TableCell>
                  <TableCell>{formatTime(shift.start)}</TableCell>
                  <TableCell>
                    {shift.end ? formatTime(shift.end) : "פעיל"}
                  </TableCell>
                  <TableCell>
                    {formatDurationDisplay(shift.netWorkTime)}
                  </TableCell>
                  <TableCell>
                    {formatDurationDisplay(shift.totalBreakTime)} (
                    {shift.breaks.length})
                  </TableCell>
                  <TableCell>
                    {shift.status === "takin" ? (
                      <Badge
                        variant="outline"
                        className="bg-green-500/10 text-green-600 border-green-200"
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" /> תקין
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-red-500/10 text-red-600 border-red-200"
                      >
                        <AlertCircle className="w-3 h-3 mr-1" /> חריגה
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
