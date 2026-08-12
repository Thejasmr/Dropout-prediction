import { create } from "zustand";

export const useSettingsStore = create((set) => ({
  highThreshold: 70,
  mediumThreshold: 40,
  weights: {
    attendance: 35,
    academic: 25,
    attempt: 20,
    fee: 15,
    assignment: 5,
  },
  setThresholds: (high, medium) => set({ highThreshold: high, mediumThreshold: medium }),
  setWeight: (key, val) =>
    set((state) => ({
      weights: { ...state.weights, [key]: val },
    })),
}));
