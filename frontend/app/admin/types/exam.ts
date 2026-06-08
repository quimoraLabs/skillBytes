export interface Exam {
  id: string;
  name: string;
  description: string;
}

export interface Subject {
  id: string;
  exam_id: string; 
  name: string;
  
}

export interface Chapter {
  id: string;
  subject_id: string; 
  name: string;
}

//Pagination interface for consistent paginated responses across subjects, chapters, and quizzes
export interface PaginationMeta {
  total_items: number;
  current_page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// 2. Reusable Generic Paginated Response Schema to standardize API responses for lists of subjects, chapters, and quizzes
export interface PaginatedResponse<T> {
  data: T[]; // Generic array of items (subjects, chapters, quizzes) that adapts to the specific endpoint's needs
  pagination: PaginationMeta;
}

// Keep the global state clean and predictable
export interface ContentStoreState {
  exams: Exam[];
  subjects: Subject[];
  isLoading: boolean;
  error: string | null;
  chapters: Chapter[];
  // Exam APIs
  fetchExams: () => Promise<void>;
  createExam: (payload: Omit<Exam, 'id'>) => Promise<{ success: boolean }>;
  
  // Upcoming Subject APIs (Ready to drop in later!)
  fetchSubjectsByExam: (examId: string) => Promise<void>;
  createSubject: (payload: Omit<Subject, 'id'>) => Promise<{ success: boolean }>;
 getAllSubjects: () => Promise<PaginatedResponse<Subject> | void>; 
  
  // --- CHAPTER APIs ---
  getAllChapters: () => Promise<PaginatedResponse<Chapter> | void>;
  fetchChaptersBySubject: (subjectId: string) => Promise<void>;
  createChapter: (payload: Omit<Chapter, 'id'>) => Promise<{ success: boolean }>;
  clearError: () => void;
}