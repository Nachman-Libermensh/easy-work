import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  layoutMode: "top" | "side";
  setLayoutMode: (mode: "top" | "side") => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      layoutMode: "side", // ברירת מחדל מועדפת
      setLayoutMode: (mode) => set({ layoutMode: mode }),
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "ui-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({ layoutMode: state.layoutMode }), // שומרים רק את ה-layoutMode
    }
  )
);
