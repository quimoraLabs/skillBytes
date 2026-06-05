import { create } from "zustand";
import { apiClient } from "../lib/apiClient";
import { ContentStoreState } from "../admin/types/exam";

export const useContentStore = create<ContentStoreState>((set) => ({
  exams: [],
  subjects: [],
  isLoading: false,
  error: null,

  // --- EXAM LAYER ---
  fetchExams: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.get("/exams/");
      set({ exams: res.data, isLoading: false });
    } catch (err: unknown) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  createExam: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post("/exams/", payload);
      set((state) => ({ exams: [...state.exams, res.data], isLoading: false }));
      return { success: true };
    } catch (err: unknown) {
      set({ error: (err as Error).message, isLoading: false });
      return { success: false };
    }
  },


  // --- FUTURE SUBJECT LAYER (Saves you from creating a whole new store!) ---
  fetchSubjectsByExam: async (examId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.get(`/subjects/?examId=${examId}`);
      set({ subjects: res.data, isLoading: false });
    } catch (err: unknown) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  createSubject: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post("/subjects/", payload);
      set((state) => ({
        subjects: [...state.subjects, res.data],
        isLoading: false,
      }));
      return { success: true };
    } catch (err: unknown) {
      set({ error: (err as Error).message, isLoading: false });
      return { success: false };
    }
  },

  clearError: () => set({ error: null }),
}));
