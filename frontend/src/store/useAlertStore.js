import { create } from "zustand";

export const useAlertStore = create((set) => ({
  unreadCount: 3,
  severityFilter: "",
  setUnreadCount: (count) => set({ unreadCount: count }),
  setSeverityFilter: (severity) => set({ severityFilter: severity }),
  decrementUnread: () => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
}));
