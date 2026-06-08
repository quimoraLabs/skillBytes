import { create } from "zustand";
import { Chapter, ContentStoreState, Exam, PaginatedResponse, Subject } from "../admin/types/exam"; // Path check kar lijiye aapke folder structure ke hisab se
import { apiClient } from "../lib/apiClient";

export const useContentStore = create<ContentStoreState>((set) => ({
  exams: [],
  subjects: [],
  chapters: [],
  isLoading: false,
  error: null,

  // --- EXAM LAYER ---
  fetchExams: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.get<Exam[]>("/exams/");
      set({ exams: res.data, isLoading: false });
    } catch (err: unknown) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  createExam: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post<Exam>("/exams/", payload);
      set((state) => ({ exams: [...state.exams, res.data], isLoading: false }));
      return { success: true };
    } catch (err: unknown) {
      set({ error: (err as Error).message, isLoading: false });
      return { success: false };
    }
  },

  // --- SUBJECT LAYER MATCHING YOUR SCHEMA ---
  fetchSubjectsByExam: async (examId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.get<{ subjects: Subject[] } >(`/exams/${examId}`);
      
      // Backend object handle mapping: agar wrap hoke aaye toh res.data.subjects, varna seedhe array payload extraction
      const subjectList = res.data.subjects;
      
      set({ subjects: subjectList, isLoading: false });
    } catch (err: unknown) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  createSubject: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post<Subject>("/subjects/", payload);
      const newSubject = res.data;

      set((state) => ({
        subjects: [...state.subjects, newSubject],
        isLoading: false,
      }));
      return { success: true };
    } catch (err: unknown) {
      set({ error: (err as Error).message, isLoading: false });
      return { success: false };
    }
  },

  getAllSubjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.get<PaginatedResponse<Subject>>("/subjects/");
      set({ subjects: res.data.data, isLoading: false });
    } catch (err: unknown) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },
  
  getAllChapters: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.get<PaginatedResponse<Chapter>>("/chapters/");
      set({ chapters: res.data.data, isLoading: false });
    } catch (err: unknown) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  fetchChaptersBySubject: async (subjectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.get(`/subjects/${subjectId}`);
      set({ chapters: res.data.chapters, isLoading: false });
    } catch (err: unknown) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  createChapter: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post(`/chapters/`, payload);
      set((state) => ({
        chapters: [...state.chapters, res.data],
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
