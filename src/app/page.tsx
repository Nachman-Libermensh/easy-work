"use client";

import { motion } from "framer-motion";
import { TimerSection } from "@/src/components/dashboard/timer-section";
import { StatsSection } from "@/src/components/dashboard/stats-section";
import { QuickSettings } from "@/src/components/dashboard/quick-settings";
import { NowPlaying } from "@/src/components/dashboard/now-playing";
import { WorkHistory } from "@/src/components/dashboard/work-history";
import { StatsCharts } from "@/src/components/dashboard/stats-charts";

export default function Home() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">לוח עבודה יומי</h1>
        <p className="text-muted-foreground">
          נהלו את יום העבודה שלכם, האזינו למוזיקה ועקבו אחר ההפסקות.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <TimerSection />

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="space-y-6"
        >
          {/* We might want to keep the Quick Stats or replace with something else */}
          <StatsSection />
          <QuickSettings />
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <StatsCharts />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <WorkHistory />
      </motion.div>

      <NowPlaying />
    </div>
  );
}
