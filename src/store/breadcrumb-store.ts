import { create } from "zustand";

interface BreadcrumbState {
  overrides: Record<string, string>;
  setBreadcrumb: (path: string, title: string) => void;
}

export const useBreadcrumbStore = create<BreadcrumbState>((set) => ({
  overrides: {},
  setBreadcrumb: (path, title) =>
    set((state) => {
      // Avoid unnecessary updates if value hasn't changed
      if (state.overrides[path] === title) return state;

      return {
        overrides: {
          ...state.overrides,
          [path]: title,
        },
      };
    }),
}));
