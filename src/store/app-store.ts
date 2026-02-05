import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { get, set, del } from "idb-keyval";

export interface BreakSession {
  start: string;
  end?: string;
}

export interface Shift {
  id: string;
  start: string;
  end?: string;
  breaks: BreakSession[];
}

export interface PlaylistItem {
  id: string;
  url: string;
  title: string;
  isAutoTitle?: boolean;
}

// Keeping this for legacy support if needed, but we move to Shift
export interface WorkLogEntry {
  id: string;
  startedAt: string;
  durationMinutes: number;
}

interface AppState {
  // Work State
  workStatus: "idle" | "working" | "break";
  currentShift: Shift | null;
  shiftHistory: Shift[];
  lastStateChange: string | null;

  // Work Preferences (Goals)
  workCycleDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;

  // Music
  playlist: PlaylistItem[];
  currentTrackIndex: number;
  isMusicPlaying: boolean;
  musicMode: "playlist" | "single" | "loop-playlist";
  volume: number;
  currentTrackProgress: number; // seconds
  currentTrackDuration: number; // seconds
  seekRequest: number | null;

  // Widget Position & State
  musicWidgetPosition: { x: number; y: number };
  isMusicWidgetMinimized: boolean;

  // Settings
  pushEnabled: boolean;

  // Stats
  workLog: WorkLogEntry[];

  // Actions
  setWorkStatus: (status: "idle" | "working" | "break") => void;
  startWork: () => void;
  startBreak: () => void;
  stopWork: () => void;

  // Settings Actions
  setWorkCycleDuration: (minutes: number) => void;
  setShortBreakDuration: (minutes: number) => void;
  setLongBreakDuration: (minutes: number) => void;
  setSessionsBeforeLongBreak: (sessions: number) => void;

  addWorkLog: (durationMinutes: number, startedAt?: string) => void;
  addToPlaylist: (url: string, title?: string) => Promise<void>;
  updateTrackTitle: (id: string, title: string) => void;
  removeFromPlaylist: (id: string) => void;

  // Music Controls
  playMusic: () => void;
  pauseMusic: () => void;
  toggleMusic: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setMusicMode: (mode: "playlist" | "single" | "loop-playlist") => void;
  cycleMusicMode: () => void;

  // Updated/Added Music Setters
  setProgress: (progress: number, duration: number) => void;
  setCurrentTrackProgress: (progress: number) => void; // Added
  setCurrentTrackDuration: (duration: number) => void; // Added

  seekTo: (seconds: number) => void;
  clearSeekRequest: () => void;
  setVolume: (vol: number) => void;
  setCurrentTrackIndex: (index: number) => void;
  setMusicWidgetPosition: (pos: { x: number; y: number }) => void;
  setMusicWidgetMinimized: (minimized: boolean) => void;
  togglePush: () => void;
}

// Custom storage object using IndexedDB via idb-keyval
const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Defaults
      workStatus: "idle",
      currentShift: null,
      shiftHistory: [],
      lastStateChange: null,

      workCycleDuration: 60,
      shortBreakDuration: 5,
      longBreakDuration: 30,
      sessionsBeforeLongBreak: 4,

      playlist: [],
      currentTrackIndex: 0,
      currentTrackProgress: 0,
      currentTrackDuration: 0,
      seekRequest: null,
      isMusicPlaying: false,
      musicMode: "playlist",
      volume: 0.5,

      musicWidgetPosition: { x: 0, y: 0 },
      isMusicWidgetMinimized: false,

      pushEnabled: false,

      workLog: [], // Legacy

      // Work Actions
      setWorkStatus: (status) =>
        set({ workStatus: status, lastStateChange: new Date().toISOString() }),
      startWork: () => {
        const now = new Date().toISOString();
        const { workStatus, currentShift } = get();

        // Return from break or start new shift?
        if (workStatus === "break" && currentShift) {
          // End the last break
          const breaks = [...currentShift.breaks];
          const lastBreak = breaks[breaks.length - 1];
          if (lastBreak && !lastBreak.end) {
            lastBreak.end = now;
            // Update break in list
            breaks[breaks.length - 1] = lastBreak;
            set({
              currentShift: { ...currentShift, breaks },
              workStatus: "working",
              lastStateChange: now,
            });
          } else {
            set({ workStatus: "working", lastStateChange: now });
          }
        } else if (workStatus === "idle" || !currentShift) {
          // New Shift
          set({
            workStatus: "working",
            lastStateChange: now,
            currentShift: {
              id: crypto.randomUUID(),
              start: now,
              breaks: [],
            },
          });
        }
      },
      startBreak: () => {
        const now = new Date().toISOString();
        const { currentShift } = get();

        if (currentShift) {
          set({
            workStatus: "break",
            lastStateChange: now,
            currentShift: {
              ...currentShift,
              breaks: [...currentShift.breaks, { start: now }],
            },
          });
        }
      },
      stopWork: () => {
        const now = new Date().toISOString();
        const { currentShift, shiftHistory } = get();

        if (currentShift) {
          const completedShift = { ...currentShift, end: now };
          // If currently on break, close it
          const lastBreak =
            completedShift.breaks[completedShift.breaks.length - 1];
          if (lastBreak && !lastBreak.end) {
            lastBreak.end = now;
          }

          set({
            workStatus: "idle",
            lastStateChange: null,
            currentShift: null,
            shiftHistory: [completedShift, ...shiftHistory],
            isMusicPlaying: false,
          });
        } else {
          set({
            workStatus: "idle",
            lastStateChange: null,
            isMusicPlaying: false,
          });
        }
      },

      setWorkCycleDuration: (minutes) => set({ workCycleDuration: minutes }),
      setShortBreakDuration: (minutes) => set({ shortBreakDuration: minutes }),
      setLongBreakDuration: (minutes) => set({ longBreakDuration: minutes }),
      setSessionsBeforeLongBreak: (sessions) =>
        set({ sessionsBeforeLongBreak: sessions }),

      addWorkLog: (durationMinutes, startedAt) =>
        set((state) => ({
          workLog: [
            ...state.workLog,
            {
              id: crypto.randomUUID(),
              startedAt: startedAt ?? new Date().toISOString(),
              durationMinutes,
            },
          ],
        })),

      // Playlist
      addToPlaylist: async (url, title) => {
        const finalTitle =
          title?.trim() || `Track ${get().playlist.length + 1}`;

        const isAuto = false;
        const id = crypto.randomUUID();

        set((state) => ({
          playlist: [
            ...state.playlist,
            {
              id,
              url,
              title: finalTitle,
              isAutoTitle: isAuto,
            },
          ],
        }));
      },
      updateTrackTitle: (id, title) =>
        set((state) => ({
          playlist: state.playlist.map((track) =>
            track.id === id ? { ...track, title, isAutoTitle: false } : track,
          ),
        })),
      removeFromPlaylist: (id) =>
        set((state) => {
          const removeIndex = state.playlist.findIndex((p) => p.id === id);
          const nextPlaylist = state.playlist.filter((p) => p.id !== id);
          let nextIndex = state.currentTrackIndex;

          if (removeIndex !== -1) {
            if (removeIndex < state.currentTrackIndex) {
              nextIndex -= 1;
            } else if (
              removeIndex === state.currentTrackIndex &&
              nextIndex >= nextPlaylist.length
            ) {
              nextIndex = Math.max(0, nextPlaylist.length - 1);
            }
          }

          return {
            playlist: nextPlaylist,
            currentTrackIndex: Math.max(0, nextIndex),
          };
        }),

      // Music Player
      setProgress: (progress, duration) =>
        set({ currentTrackProgress: progress, currentTrackDuration: duration }),

      // --- New Actions Implementation ---
      setCurrentTrackProgress: (progress) =>
        set({ currentTrackProgress: progress }),

      setCurrentTrackDuration: (duration) =>
        set({ currentTrackDuration: duration }),
      // ----------------------------------

      seekTo: (seconds) => set({ seekRequest: seconds }),
      clearSeekRequest: () => set({ seekRequest: null }),

      playMusic: () => set({ isMusicPlaying: true }),
      pauseMusic: () => set({ isMusicPlaying: false }),
      toggleMusic: () =>
        set((state) => ({ isMusicPlaying: !state.isMusicPlaying })),

      nextTrack: () =>
        set((state) => {
          const count = state.playlist.length;
          if (count === 0) return {};

          let nextIndex = state.currentTrackIndex;

          if (state.musicMode === "single") {
            // במצב יחיד, אם הפונקציה נקראת אוטומטית בסוף שיר, נרצה לחזור להתחלה (Replay).
            // אם המשתמש לוחץ ידנית, הקומפוננטה בדרך כלל תקרא ל-setCurrentTrackIndex.
            // נניח כאן שזה לוגיקת "סוף שיר" או העברה כפויה.
            // כרגע נשאיר Replay למצב יחיד כדי שיתנגן בלופ.
            return { seekRequest: 0 };
          } else if (
            state.musicMode === "loop-playlist" ||
            state.musicMode === "playlist"
          ) {
            nextIndex = (state.currentTrackIndex + 1) % count;

            // במצב פלייליסט רגיל (ללא לופ), אם הגענו לסוף - עוצרים.
            if (
              state.musicMode === "playlist" &&
              state.currentTrackIndex + 1 >= count
            ) {
              return { isMusicPlaying: false };
            }
            return { currentTrackIndex: (state.currentTrackIndex + 1) % count };
          }

          return { currentTrackIndex: (state.currentTrackIndex + 1) % count };
        }),
      previousTrack: () =>
        set((state) => {
          const count = state.playlist.length;
          if (count === 0) return {};
          // If > 3 sec, replay.
          if (state.currentTrackProgress > 3) {
            return { seekRequest: 0 };
          }
          const prevIndex = (state.currentTrackIndex - 1 + count) % count;
          return { currentTrackIndex: prevIndex };
        }),

      setCurrentTrackIndex: (index) =>
        set((state) => ({
          currentTrackIndex: Math.max(
            0,
            Math.min(index, state.playlist.length - 1),
          ),
        })),

      setMusicMode: (mode) => set({ musicMode: mode }),
      cycleMusicMode: () =>
        set((state) => {
          const modes: ("playlist" | "single" | "loop-playlist")[] = [
            "playlist",
            "loop-playlist",
            "single",
          ];
          const current = modes.indexOf(state.musicMode);
          const next = (current + 1) % modes.length;
          return { musicMode: modes[next] };
        }),

      setMusicWidgetPosition: (pos) => set({ musicWidgetPosition: pos }),
      setMusicWidgetMinimized: (minimized) =>
        set({ isMusicWidgetMinimized: minimized }),

      setVolume: (vol) => set({ volume: vol }),

      togglePush: () => set((state) => ({ pushEnabled: !state.pushEnabled })),
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => storage),
    },
  ),
);
