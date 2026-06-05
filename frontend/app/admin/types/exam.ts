export interface Exam {
  id: string;
  name: string;
  description: string;
}

export interface Subject {
  id: string;
  examId: string; // Links back to parent Exam
  name: string;
}

// Keep the global state clean and predictable
export interface ContentStoreState {
  exams: Exam[];
  subjects: Subject[];
  isLoading: boolean;
  error: string | null;
  
  // Exam APIs
  fetchExams: () => Promise<void>;
  createExam: (payload: Omit<Exam, 'id'>) => Promise<{ success: boolean }>;
  
  // Upcoming Subject APIs (Ready to drop in later!)
  fetchSubjectsByExam: (examId: string) => Promise<void>;
  createSubject: (payload: Omit<Subject, 'id'>) => Promise<{ success: boolean }>;
  
  clearError: () => void;
}