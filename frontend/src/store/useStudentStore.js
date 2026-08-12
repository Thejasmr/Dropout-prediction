import { create } from "zustand";

export const useStudentStore = create((set) => ({
  searchQuery: "",
  riskFilter: "",
  selectedStudent: null,
  setSearchQuery: (query) => set({ searchQuery: query }),
  setRiskFilter: (filter) => set({ riskFilter: filter }),
  setSelectedStudent: (student) => set({ selectedStudent: student }),
}));
