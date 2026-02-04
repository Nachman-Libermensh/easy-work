"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/src/components/ui/chart";
import { useAppStore } from "@/src/store/app-store";
import { useMemo } from "react";

export function StatsCharts() {
  const { shiftHistory, workCycleDuration } = useAppStore();
  const [now, setNow] = React.useState(0);

  React.useEffect(() => {
    setNow(Date.now());
  }, []);

  const chartData = useMemo(() => {
    if (now === 0) return [];

    // Group by Date
    const grouped = shiftHistory.reduce(
      (acc, shift) => {
        const date = new Date(shift.start).toLocaleDateString("en-CA"); // YYYY-MM-DD
        if (!acc[date]) {
          acc[date] = { date, workMinutes: 0, breakMinutes: 0, violations: 0 };
        }

        const start = new Date(shift.start).getTime();
        const end = shift.end ? new Date(shift.end).getTime() : now; // active shift counts to now
        const durationMins = (end - start) / 1000 / 60;

        let breakMins = 0;
        shift.breaks.forEach((b) => {
          const bStart = new Date(b.start).getTime();
          const bEnd = b.end ? new Date(b.end).getTime() : now;
          breakMins += (bEnd - bStart) / 1000 / 60;
        });

        const netWork = durationMins - breakMins;

        // Calc violations (simple check per shift)
        const expectedBreaks = Math.floor(netWork / workCycleDuration);
        const actualBreaks = shift.breaks.length;
        if (actualBreaks < expectedBreaks) {
          acc[date].violations += 1;
        }

        acc[date].workMinutes += netWork;
        acc[date].breakMinutes += breakMins;

        return acc;
      },
      {} as Record<
        string,
        {
          date: string;
          workMinutes: number;
          breakMinutes: number;
          violations: number;
        }
      >,
    );

    // Convert to array and sort last 7-14 days
    return Object.values(grouped)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14)
      .map((item) => ({
        ...item,
        formattedDate: new Date(item.date).toLocaleDateString("he-IL", {
          day: "2-digit",
          month: "2-digit",
        }),
        hours: parseFloat((item.workMinutes / 60).toFixed(1)),
      }));
  }, [shiftHistory, workCycleDuration, now]);

  const chartConfig = {
    workMinutes: {
      label: "שעות עבודה",
      color: "hsl(var(--chart-1))",
    },
    breakMinutes: {
      label: "זמן הפסקה",
      color: "hsl(var(--chart-2))",
    },
    violations: {
      label: "חריגות מיעדים",
      color: "hsl(var(--destructive))",
    },
  } satisfies ChartConfig;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>משך עבודה יומי</CardTitle>
          <CardDescription>
            מעקב שעות עבודה נטו בשבועיים האחרונים
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillWork" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-workMinutes)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-workMinutes)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="formattedDate"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}h`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="hours"
                type="monotone"
                fill="url(#fillWork)"
                fillOpacity={0.4}
                stroke="var(--color-workMinutes)"
                strokeWidth={2}
                name="work"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>עמידה ביעדים</CardTitle>
          <CardDescription>מספר חריגות מהגדרות הפסקה</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="formattedDate"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar
                dataKey="violations"
                fill="var(--color-violations)"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
