import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PlaylistItem {
  id: string;
  url: string;
  title: string;
  isAutoTitle?: boolean;
}

export interface WorkLogEntry {
  id: string;
  startedAt: string;
  durationMinutes: number;
}

interface AppState {
  // Timer Settings
  workDuration: number; // minutes
  breakDuration: number; // minutes
  longBreakDuration: number; // minutes
  sessionsBeforeLongBreak: number;

  // Timer State
  timerState: "idle" | "work" | "break" | "long-break";
  timeLeft: number; // seconds
  isActive: boolean;
  currSession: number;

  // Music
  playlist: PlaylistItem[];
  currentTrackIndex: number;
  isMusicPlaying: boolean;
  musicMode: "playlist" | "single" | "sequence";
  volume: number;
  currentTrackProgress: number; // seconds
  currentTrackDuration: number; // seconds
  seekRequest: number | null; // Timestamp to seek to. Null if no pending seek.

  // Settings
  pushEnabled: boolean;

  // Stats
  workLog: WorkLogEntry[];

  // Actions
  setWorkDuration: (minutes: number) => void;
  setBreakDuration: (minutes: number) => void;
  setLongBreakDuration: (minutes: number) => void;
  setSessionsBeforeLongBreak: (sessions: number) => void;
  setTimerState: (state: "idle" | "work" | "break" | "long-break") => void;
  setTimeLeft: (seconds: number) => void;
  setIsActive: (active: boolean) => void;
  setCurrSession: (session: number) => void;
  incrementSession: () => void;
  addWorkLog: (durationMinutes: number, startedAt?: string) => void;
  addToPlaylist: (url: string, title?: string) => void;
  updateTrackTitle: (id: string, title: string) => void; // Added
  removeFromPlaylist: (id: string) => void;
  playMusic: () => void;
  pauseMusic: () => void;
  setProgress: (progress: number, duration: number) => void;
  seekTo: (seconds: number) => void;
  clearSeekRequest: () => void;
  nextTrack: () => void;
  setCurrentTrackIndex: (index: number) => void;
  setMusicMode: (mode: "playlist" | "single" | "sequence") => void;
  setVolume: (vol: number) => void;
  togglePush: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      workDuration: 25,
      breakDuration: 5,
      longBreakDuration: 15,
      sessionsBeforeLongBreak: 4,

      timerState: "idle",
      timeLeft: 25 * 60,
      isActive: false,
      currSession: 0,

      playlist: [],
      currentTrackIndex: 0,
      currentTrackProgress: 0,
      currentTrackDuration: 0,
      seekRequest: null,
      isMusicPlaying: false,
      musicMode: "playlist",
      volume: 0.5,

      pushEnabled: false,

      workLog: [],

      setWorkDuration: (minutes) => set({ workDuration: minutes }),
      setBreakDuration: (minutes) => set({ breakDuration: minutes }),
      setLongBreakDuration: (minutes) => set({ longBreakDuration: minutes }),
      setSessionsBeforeLongBreak: (sessions) =>
        set({ sessionsBeforeLongBreak: sessions }),
      setTimerState: (state) => set({ timerState: state }),
      setTimeLeft: (seconds) => set({ timeLeft: seconds }),
      setIsActive: (active) => set({ isActive: active }),
      setCurrSession: (session) => set({ currSession: session }),
      incrementSession: () =>
        set((state) => ({ currSession: state.currSession + 1 })),
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

      addToPlaylist: (url, title) =>
        set((state) => ({
          playlist: [
            ...state.playlist,
            {
              id: crypto.randomUUID(),
              url,
              title: title?.trim() || `Track ${state.playlist.length + 1}`,
              isAutoTitle: !title?.trim(), // Mark if it was auto-generated or empty
            },
          ],
        })),
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
      setProgress: (progress, duration) =>
        set({ currentTrackProgress: progress, currentTrackDuration: duration }),
      seekTo: (seconds) => set({ seekRequest: seconds }),
      clearSeekRequest: () => set({ seekRequest: null }),

      playMusic: () => set({ isMusicPlaying: true }),
      pauseMusic: () => set({ isMusicPlaying: false }),
      nextTrack: () =>
        set((state) => ({
          ...(state.playlist.length === 0
            ? {}
            : state.musicMode === "single"
              ? { currentTrackIndex: state.currentTrackIndex }
              : state.musicMode === "sequence"
                ? state.currentTrackIndex + 1 < state.playlist.length
                  ? { currentTrackIndex: state.currentTrackIndex + 1 }
                  : { isMusicPlaying: false }
                : {
                    currentTrackIndex:
                      (state.currentTrackIndex + 1) % state.playlist.length,
                  }),
        })),
      setCurrentTrackIndex: (index) =>
        set((state) => ({
          currentTrackIndex: Math.max(
            0,
            Math.min(index, state.playlist.length - 1),
          ),
        })),
      setMusicMode: (mode) => set({ musicMode: mode }),
      setVolume: (vol) => set({ volume: vol }),
      togglePush: () => set((state) => ({ pushEnabled: !state.pushEnabled })),
    }),
    {
      name: "app-storage",
    },
  ),
);
