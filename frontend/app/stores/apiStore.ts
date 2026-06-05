import { create } from 'zustand';
import axios from 'axios';

// Backend response structure for raw generic query objects
interface RawBackendItem {
  name?: string;
  title?: string;
  exam_id?: string;
  subject_id?: string;
  chapter_id?: string;
  id?: string | number;
  _id?: string | number;
}

// Standardized structure enforced across the entire frontend UI selections
interface QuizItem {
  id: string | number;
  name: string;
}

// Structure representing single quiz items returned inside chapter objects
interface BackendQuizNode {
  quiz_id?: string;
  id?: string;
  quiz_title?: string;
  title?: string;
}

// Structure representing questions inside the raw network payload stream
interface BackendQuestionNode {
  question_id?: string;
  question_text?: string;
  text?: string;
  options?: string[];
}

// Normalized single question schema structure used by frontend components safely
interface Question {
  question_id: string;
  text: string;
  options: string[];
}

// User submission schema required by the /attempts/submit endpoint
interface UserResponse {
  question_id: string;
  selected_option: string | null;
  is_skipped: boolean;
}

// Global state interface definition for Zustand application store
interface QuizState {
  currentStep: string;
  guestId: string | null;
  exams: QuizItem[];
  subjects: QuizItem[];
  chapters: QuizItem[];
  quizzes: QuizItem[];
  selectedExam: string | null;
  selectedSubject: string | null;
  selectedChapter: string | null;
  isLoading: boolean;
  quizErrorMessage: string | null;

  // Core quiz tracking system mechanics
  quizId: string | null;
  questions: Question[];
  currentQuestionIndex: number;
  attemptId: string | null;
  responses: UserResponse[];
  quizResult: Record<string, unknown> | null; // Safe typed object replacement for 'any' matching network validation

  initGuestSession: () => Promise<void>;
  selectExam: (id: string | number, name: string) => Promise<void>;
  selectSubject: (id: string | number, name: string) => Promise<void>;
  selectChapter: (id: string | number, name: string) => Promise<void>;
  selectQuiz: (id: string | number, name: string) => void;
  startActualQuiz: () => Promise<void>;
  submitAnswer: (selectedOption: string | null, isSkipped: boolean) => Promise<void>;
  goBack: () => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  currentStep: 'welcome',
  guestId: null,
  exams: [],
  subjects: [],
  chapters: [],
  quizzes: [],
  selectedExam: null,
  selectedSubject: null,
  selectedChapter: null,
  isLoading: false,

  // Default quiz parameters setup configuration
  quizId: null,
  questions: [],
  currentQuestionIndex: 0,
  attemptId: null,
  responses: [],
  quizResult: null,
  quizErrorMessage: null,

  // Creates standard anonymous session and gets available exams array list
  initGuestSession: async () => {
    set({ isLoading: true });
    try {
      const guestRes = await axios.post('http://localhost:8000/auth/guest');
      const gId = guestRes.data.user_id as string;
      const examRes = await axios.get('http://localhost:8000/exams/all');
      const rawExams = (Array.isArray(examRes.data) ? examRes.data : (examRes.data?.exams || examRes.data?.data || [])) as RawBackendItem[];
      
      const cleanExams: QuizItem[] = rawExams.map((item) => ({
        id: item.exam_id || item.id || item._id || '',
        name: item.name || item.title || 'Untitled'
      }));
      
      set({ guestId: gId, exams: cleanExams, currentStep: 'exam', isLoading: false });
    } catch (error) {
      console.error("Session initialization failed:", error);
      set({ isLoading: false });
    }
  },

  // Pulls contextual available subject entries filtering by exam id
  selectExam: async (id: string | number, name: string) => {
    if (!id || id === 'undefined') return;
    set({ selectedExam: name, isLoading: true, quizErrorMessage: null });
    try {
      const res = await axios.get(`http://localhost:8000/exams/${id}`);
      const rawSubjects = (Array.isArray(res.data) ? res.data : (res.data?.subjects || res.data?.data || [])) as RawBackendItem[];
      
      const cleanSubjects: QuizItem[] = rawSubjects.map((item) => ({
        id: item.subject_id || item.id || item._id || '',
        name: item.name || item.title || 'Untitled'
      }));
      
      set({ subjects: cleanSubjects, currentStep: 'subject', isLoading: false });
    } catch (error) {
      console.error("Failed to fetch subjects for selected exam:", error);
      set({ isLoading: false });
    }
  },

  // Fetches nested chapters mapping structure using specific subject index lookup
  selectSubject: async (id: string | number, name: string) => {
    if (!id || id === 'undefined') return;
    set({ selectedSubject: name, isLoading: true, quizErrorMessage: null });
    try {
      const res = await axios.get(`http://localhost:8000/subjects/${id}`);
      const rawChapters = (Array.isArray(res.data) ? res.data : (res.data?.chapters || res.data?.data || [])) as RawBackendItem[];
      
      const cleanChapters: QuizItem[] = rawChapters.map((item) => ({
        id: item.chapter_id || item.id || item._id || '',
        name: item.name || item.title || 'Untitled'
      }));
      
      set({ chapters: cleanChapters, currentStep: 'chapter', isLoading: false });
    } catch (error) {
      console.error("Failed to fetch chapters for selected subject:", error);
      set({ isLoading: false });
    }
  },

  // Investigates a single chapter instance to see if single or multiple quizzes exist
  selectChapter: async (id: string | number, name: string) => {
    if (!id || id === 'undefined') return;
    set({ selectedChapter: name, isLoading: true, quizErrorMessage: null });
    
    try {
      const chapterRes = await axios.get(`http://localhost:8000/chapters/${id}`);
      const rawQuizzes = (chapterRes.data.quizzes || []) as BackendQuizNode[];
      
      const cleanQuizzes: QuizItem[] = rawQuizzes.map((q) => ({
        id: q.quiz_id || q.id || '',
        name: q.quiz_title || q.title || 'Standard Practice Quiz'
      }));

      // CASE A: Absolutely zero quizzes found under this chapter
      if (cleanQuizzes.length === 0) {
        set({
          quizzes: [],
          quizId: null,
          currentStep: 'no_quiz_error', // 👈 New safe error step state
          isLoading: false
        });
      } 
      // CASE B: Exactly one quiz node is allocated
      else if (cleanQuizzes.length === 1) {
        set({
          quizzes: cleanQuizzes,
          quizId: String(cleanQuizzes[0].id),
          currentStep: 'quiz_overview',
          isLoading: false
        });
      } 
      // CASE C: Multiple choices found
      else {
        set({ 
          quizzes: cleanQuizzes, 
          currentStep: 'quiz_list', 
          isLoading: false 
        });
      }
    } catch (error) {
      console.error("Failed to load chapter quizzes:", error);
      // Fallback state logic to prevent UI freeze
      set({ currentStep: 'no_quiz_error', quizzes: [], isLoading: false });
    }
  },

  // Assigns precise evaluation track keys to local state context
  selectQuiz: (id: string | number, name: string) => {
    console.debug("Selected quiz:", name);
    set({
      quizId: String(id),
      currentStep: 'quiz_overview'
    });
  },

  // Submits state configurations via POST request to retrieve structural quiz payload files
  startActualQuiz: async () => {
    const { guestId, quizId } = get();
    if (!quizId) return;

    if (!guestId) {
      console.error("Cannot start quiz: guest session is missing.");
      set({
        quizErrorMessage: 'Your guest session was not created correctly. Please go back to the start and try again.',
        isLoading: false,
        currentStep: 'quiz_overview'
      });
      return;
    }

    set({ isLoading: true });

    try {
      const startPayload = {
        student_id: guestId,
        quiz_id: quizId 
      };

      const res = await axios.post('http://localhost:8000/attempts/start', startPayload);
      
      const serverAttemptId = res.data.attempt_id as string;
      const quizDetails = (res.data.quiz_details || {}) as Record<string, unknown>;
      const rawQuestions = (quizDetails.questions || []) as BackendQuestionNode[];

      // Normalized conversion map preventing unhandled generic type properties errors
      const cleanQuestions: Question[] = rawQuestions.map((q) => ({
        question_id: q.question_id || '',
        text: q.question_text || q.text || 'Empty Question Prompt',
        options: Array.isArray(q.options) ? q.options : []
      }));

      if (cleanQuestions.length === 0) {
        set({
          quizErrorMessage: 'No questions were found for this quiz. Please choose another chapter or contact support.',
          currentStep: 'no_questions',
          isLoading: false,
          attemptId: serverAttemptId,
          questions: []
        });
        return;
      }

      set({
        questions: cleanQuestions,
        attemptId: serverAttemptId,
        currentStep: 'quiz',
        isLoading: false
      });
    } catch (error) {
      console.error("Failed to start session:", error);
      set({
        quizErrorMessage: 'Unable to start the quiz session at the moment. Please try again.',
        isLoading: false,
        currentStep: 'quiz_overview'
      });
    }
  },

  // Progresses current runtime pointer indexing state or commits total records payload data
  submitAnswer: async (selectedOption: string | null, isSkipped: boolean) => {
    const { questions, currentQuestionIndex, responses, attemptId } = get();
    const currentQuestion = questions[currentQuestionIndex];

    const newResponse: UserResponse = {
      question_id: currentQuestion.question_id,
      selected_option: selectedOption,
      is_skipped: isSkipped
    };

    const updatedResponses = [...responses, newResponse];
    set({ responses: updatedResponses });

    if (currentQuestionIndex + 1 < questions.length) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    } else {
      set({ isLoading: true });
      try {
        const finalSubmissionBody = {
          attempt_id: attemptId,
          responses: updatedResponses
        };

        const resultRes = await axios.post('http://localhost:8000/attempts/submit', finalSubmissionBody);
        
        set({
          quizResult: resultRes.data as Record<string, unknown>,
          currentStep: 'result',
          isLoading: false
        });
      } catch (error) {
        console.error("Error submitting test results payload:", error);
        set({ currentStep: 'result', isLoading: false });
      }
    }
  },

  // Safely restores screen index layers avoiding dead-end broken navigation states
 goBack: () => {
    const { currentStep } = get();
    if (currentStep === 'exam') {
      set({ currentStep: 'welcome', selectedExam: null, subjects: [], chapters: [] });
    } else if (currentStep === 'subject') {
      set({ currentStep: 'exam', selectedExam: null, selectedSubject: null, subjects: [], chapters: [] });
    } else if (currentStep === 'chapter') {
      set({ currentStep: 'subject', selectedSubject: null, selectedChapter: null, chapters: [] });
    } else if (currentStep === 'quiz_list' || currentStep === 'no_quiz_error' || currentStep === 'quiz_overview' || currentStep === 'no_questions') {
      // Clean selected chapters context safely so conditional rendering can reload grids
      set({ currentStep: 'chapter', selectedChapter: null, quizId: null, quizErrorMessage: null });
    } else if (currentStep === 'quiz') {
      set({ currentStep: 'chapter', selectedChapter: null, questions: [], currentQuestionIndex: 0, responses: [] });
    } else if (currentStep === 'result') {
      // 🔄 Retake Core Fix: Reset everything to pristine clean state upon returning to chapters
      set({ 
        currentStep: 'chapter', 
        selectedChapter: null, 
        quizId: null, 
        quizResult: null, 
        questions: [], 
        currentQuestionIndex: 0, 
        responses: [] 
      });
    }
  }
}));