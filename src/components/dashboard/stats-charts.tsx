"use client";

import * as React from "react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { useAppStore } from "@/src/store/app-store";

export function StatsCharts() {
  const { shiftHistory, currentShift, workCycleDuration } = useAppStore();
  const [now, setNow] = React.useState(0);

  React.useEffect(() => {
    setNow(Date.now());

    // Update 'now' every minute to keep active charts alive
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const allShifts = useMemo(() => {
    // Combine history and current active shift
    return currentShift ? [...shiftHistory, currentShift] : shiftHistory;
  }, [shiftHistory, currentShift]);

  // 1. Sessions Data (Daily/Session Level)
  const sessionsData = useMemo(() => {
    const safeNow = now;

    return allShifts
      .slice() // copy
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .filter((shift) => {
        // Filter out very short invalid shifts (< 10 seconds)
        const end = shift.end ? new Date(shift.end).getTime() : safeNow;
        const duration = end - new Date(shift.start).getTime();
        return duration > 10000;
      })
      .slice(-20) // Last 20 sessions
      .map((shift) => {
        const start = new Date(shift.start).getTime();
        const end = shift.end ? new Date(shift.end).getTime() : safeNow;
        const totalDurationMins = (end - start) / 1000 / 60;

        let breakMins = 0;
        shift.breaks.forEach((b) => {
          const bStart = new Date(b.start).getTime();
          const bEnd = b.end ? new Date(b.end).getTime() : safeNow;
          breakMins += (bEnd - bStart) / 1000 / 60;
        });

        const netWorkMins = Math.max(0, totalDurationMins - breakMins);
        const isCurrent = shift === currentShift;

        return {
          date: new Date(shift.start).toLocaleDateString("he-IL", {
            day: "2-digit",
            month: "2-digit",
          }),
          time: new Date(shift.start).toLocaleTimeString("he-IL", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          fullDate: new Date(shift.start).toLocaleString("he-IL"),
          duration: parseFloat(netWorkMins.toFixed(2)),
          goal: workCycleDuration,
          status: netWorkMins >= workCycleDuration ? "success" : "short",
          isCurrent,
        };
      });
  }, [allShifts, now, workCycleDuration, currentShift]);

  // 2. Monthly Data
  const monthlyData = useMemo(() => {
    const safeNow = now;

    const grouped = allShifts.reduce(
      (acc, shift) => {
        const date = new Date(shift.start);
        const key = `${date.getMonth() + 1}/${date.getFullYear()}`; // MM/YYYY

        if (!acc[key]) {
          acc[key] = { month: key, timestamp: date.getTime(), totalMinutes: 0 };
        }

        const start = new Date(shift.start).getTime();
        const end = shift.end ? new Date(shift.end).getTime() : safeNow;
        const duration = (end - start) / 1000 / 60;

        // Subtract breaks
        let breaks = 0;
        shift.breaks.forEach((b) => {
          const bStart = new Date(b.start).getTime();
          const bEnd = b.end ? new Date(b.end).getTime() : safeNow;
          breaks += (bEnd - bStart) / 1000 / 60;
        });

        acc[key].totalMinutes += Math.max(0, duration - breaks);
        return acc;
      },
      {} as Record<
        string,
        { month: string; timestamp: number; totalMinutes: number }
      >,
    );

    return Object.values(grouped)
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((item) => ({
        month: item.month,
        hours: parseFloat((item.totalMinutes / 60).toFixed(2)),
      }));
  }, [allShifts, now]);

  // 3. Efficiency Data (Daily Trend)
  const efficiencyData = useMemo(() => {
    const safeNow = now;

    const grouped = allShifts.reduce(
      (acc, shift) => {
        const dateStr = new Date(shift.start).toLocaleDateString("en-CA");
        if (!acc[dateStr]) acc[dateStr] = { work: 0, total: 0 };

        const start = new Date(shift.start).getTime();
        const end = shift.end ? new Date(shift.end).getTime() : safeNow;
        const duration = (end - start) / 1000 / 60;

        let breaks = 0;
        shift.breaks.forEach((b) => {
          const bStart = new Date(b.start).getTime();
          const bEnd = b.end ? new Date(b.end).getTime() : safeNow;
          breaks += (bEnd - bStart) / 1000 / 60;
        });

        acc[dateStr].work += Math.max(0, duration - breaks);
        acc[dateStr].total += duration;
        return acc;
      },
      {} as Record<string, { work: number; total: number }>,
    );

    return Object.entries(grouped)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .slice(-14) // Last 14 days
      .map(([date, stats]) => ({
        date: new Date(date).toLocaleDateString("he-IL", {
          day: "2-digit",
          month: "2-digit",
        }),
        efficiency:
          stats.total > 0 ? Math.round((stats.work / stats.total) * 100) : 0,
      }));
  }, [allShifts, now]);

  const hasData = sessionsData.length > 0;
  const sessionsConfig = {
    duration: {
      label: "משך עבודה (דק׳)",
      color: "var(--primary)",
    },
    goal: {
      label: "יעד (דק׳)",
      color: "var(--muted-foreground)",
    },
  } satisfies ChartConfig;

  const monthlyConfig = {
    hours: {
      label: "שעות עבודה",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  const efficiencyConfig = {
    efficiency: {
      label: "יעילות (%)",
      color: "var(--chart-3)",
    },
  } satisfies ChartConfig;

  if (!hasData) {
    return (
      <Card className="col-span-full">
        <CardHeader className="p-4 pb-0">
          <CardTitle>ניתוח נתונים וסטטיסטיקה</CardTitle>
          <CardDescription>אין מספיק נתונים להצגה כרגע</CardDescription>
        </CardHeader>
        <CardContent className="p-8 flex flex-col items-center justify-center text-center text-muted-foreground gap-2">
          <div className="text-4xl">📊</div>
          <p>התחל לעבוד כדי לראות סטטיסטיקות על הביצועים שלך.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader className="p-4 pb-0">
        <div className="flex flex-col gap-2">
          <CardTitle>ניתוח נתונים וסטטיסטיקה</CardTitle>
          <CardDescription>סקירה מעמיקה של הרגלי העבודה שלך</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs dir="rtl" defaultValue="sessions" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="sessions">רצף עבודה (סשנים)</TabsTrigger>
            <TabsTrigger value="monthly">סיכום חודשי</TabsTrigger>
            <TabsTrigger value="efficiency">מדד יעילות</TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="space-y-4">
            <div className="h-[300px] w-full" dir="ltr">
              <ChartContainer config={sessionsConfig} className="h-full w-full">
                <BarChart
                  data={sessionsData}
                  margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="fullDate"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    interval={0}
                    angle={-45}
                    height={60}
                    textAnchor="end"
                    tickFormatter={(value, index) =>
                      sessionsData[index]?.time || ""
                    }
                  />
                  <YAxis hide />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        indicator="dashed"
                        labelFormatter={(label, payload) => {
                          if (payload && payload[0]) {
                            const data = payload[0].payload;
                            return `${data.fullDate} (${data.status === "success" ? "יעד הושג" : "מתחת ליעד"})`;
                          }
                          return label;
                        }}
                      />
                    }
                    cursor={{ fill: "transparent" }}
                  />
                  <ReferenceLine
                    y={workCycleDuration}
                    stroke="var(--destructive)"
                    strokeDasharray="3 3"
                    label={{
                      position: "top",
                      value: "יעד",
                      fill: "var(--destructive)",
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="duration"
                    radius={[4, 4, 0, 0]}
                    name="משך עבודה"
                  >
                    {sessionsData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.isCurrent
                            ? "var(--chart-4)" // Highlight current
                            : entry.duration >= entry.goal
                              ? "var(--primary)"
                              : "var(--muted-foreground)"
                        }
                        className={entry.isCurrent ? "animate-pulse" : ""}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              הגרף מציג את 20 הסשנים האחרונים. הסשן הנוכחי מודגש.
            </p>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <div className="h-75 w-full" dir="ltr">
              <ChartContainer config={monthlyConfig} className="h-full w-full">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="hours"
                    fill="var(--chart-2)"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </TabsContent>

          <TabsContent value="efficiency" className="space-y-4">
            <div className="h-75 w-full" dir="ltr">
              <ChartContainer
                config={efficiencyConfig}
                className="h-full w-full"
              >
                <AreaChart
                  data={efficiencyData}
                  margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="fillEfficiency"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--chart-3)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--chart-3)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="efficiency"
                    stroke="var(--chart-3)"
                    fill="url(#fillEfficiency)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              אחוז הזמן שהוקדש לעבודה נטו מתוך זמן השהייה הכולל (כולל הפסקות)
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
