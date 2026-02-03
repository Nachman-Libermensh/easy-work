import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PlaylistItem {
  id: string;
  url: string;
  title: string;
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

  // Settings
  pushEnabled: boolean;

  // Actions
  setWorkDuration: (minutes: number) => void;
  setBreakDuration: (minutes: number) => void;
  setTimerState: (state: "idle" | "work" | "break" | "long-break") => void;
  setTimeLeft: (seconds: number) => void;
  setIsActive: (active: boolean) => void;
  addToPlaylist: (url: string) => void;
  removeFromPlaylist: (id: string) => void;
  playMusic: () => void;
  pauseMusic: () => void;
  nextTrack: () => void;
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
      isMusicPlaying: false,
      musicMode: "playlist",
      volume: 0.5,

      pushEnabled: false,

      setWorkDuration: (minutes) => set({ workDuration: minutes }),
      setBreakDuration: (minutes) => set({ breakDuration: minutes }),
      setTimerState: (state) => set({ timerState: state }),
      setTimeLeft: (seconds) => set({ timeLeft: seconds }),
      setIsActive: (active) => set({ isActive: active }),

      addToPlaylist: (url) =>
        set((state) => ({
          playlist: [
            ...state.playlist,
            {
              id: crypto.randomUUID(),
              url,
              title: `Track ${state.playlist.length + 1}`,
            },
          ],
        })),
      removeFromPlaylist: (id) =>
        set((state) => ({
          playlist: state.playlist.filter((p) => p.id !== id),
        })),

      playMusic: () => set({ isMusicPlaying: true }),
      pauseMusic: () => set({ isMusicPlaying: false }),
      nextTrack: () =>
        set((state) => ({
          currentTrackIndex:
            (state.currentTrackIndex + 1) % state.playlist.length,
        })),
      setVolume: (vol) => set({ volume: vol }),
      togglePush: () => set((state) => ({ pushEnabled: !state.pushEnabled })),
    }),
    {
      name: "app-storage",
    },
  ),
);
