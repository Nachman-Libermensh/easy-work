"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Pause, Music2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useAppStore } from "@/src/store/app-store";

export function MusicFloatingControl() {
  const { isMusicPlaying, pauseMusic, playlist, currentTrackIndex } =
    useAppStore();

  const track = playlist[currentTrackIndex];

  return (
    <AnimatePresence>
      {isMusicPlaying && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-6 left-1/2 z-50 w-[min(90vw,360px)] -translate-x-1/2"
        >
          <div className="rounded-2xl border bg-background/90 shadow-xl backdrop-blur-md p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Music2 className="h-5 w-5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-muted-foreground">מנגן כעת</p>
                <p className="truncate text-sm font-medium">
                  {track?.title || "מוזיקה רגועה"}
                </p>
              </div>
            </div>
            <Button
              size="lg"
              className="rounded-full px-6"
              onClick={pauseMusic}
              aria-label="עצור מוזיקה"
            >
              <Pause className="mr-2 h-5 w-5" /> עצור
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
