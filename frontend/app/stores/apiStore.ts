import { create } from 'zustand';
import axios from 'axios';

// Interface representing the unpredictable structures coming from the backend API
interface RawBackendItem {
  name?: string;
  title?: string;       // Used by chapters or other entities instead of 'name'
  exam_id?: string;
  subject_id?: string;
  chapter_id?: string;
  id?: string | number;
  _id?: string | number;
}

// Standardized structure enforced across the entire frontend UI
interface QuizItem {
  id: string | number;
  name: string;
}

// Structuring individual questions and their selectable multiple-choice answers
interface QuestionOption {
  option_id?: string;
  text: string;
  is_correct?: boolean;
}

interface Question {
  question_id: string;
  text: string;
  options: string[] | QuestionOption[] ; // Supports multiple array configurations from backend
}

// User submission schema required by the /attempts/submit endpoint
interface UserResponse {
  question_id: string;
  selected_option: string | null;
  is_skipped: boolean;
}

interface QuizState {
  currentStep: string;
  guestId: string | null;
  exams: QuizItem[];
  subjects: QuizItem[];
  chapters: QuizItem[];
  selectedExam: string | null;
  selectedSubject: string | null;
  selectedChapter: string | null;
  isLoading: boolean;

  // Core Quiz Engine State Properties
  quizId: string | null;
  questions: Question[];
  currentQuestionIndex: number;
  attemptId: string | null;
  responses: UserResponse[];
  quizResult: null;

  initGuestSession: () => Promise<void>;
  selectExam: (id: string | number, name: string) => Promise<void>;
  selectSubject: (id: string | number, name: string) => Promise<void>;
  selectChapter: (id: string | number, name: string) => void;
  submitAnswer: (selectedOption: string | null, isSkipped: boolean) => Promise<void>;
  goBack: () => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  currentStep: 'welcome',
  guestId: null,
  exams: [],
  subjects: [],
  chapters: [],
  selectedExam: null,
  selectedSubject: null,
  selectedChapter: null,
  isLoading: false,

  // Initial Quiz Engine defaults
  quizId: null,
  questions: [],
  currentQuestionIndex: 0,
  attemptId: null,
  responses: [],
  quizResult: null,

  initGuestSession: async () => {
    set({ isLoading: true });
    try {
      const guestRes = await axios.post('http://localhost:8000/auth/guest');
      const gId = guestRes.data.guest_id;
      const examRes = await axios.get('http://localhost:8000/exams/all');
      const rawExams = Array.isArray(examRes.data) ? examRes.data : (examRes.data?.exams || examRes.data?.data || []);
      const cleanExams = (rawExams as RawBackendItem[]).map((item) => ({
        id: item.exam_id || item.id || item._id || '',
        name: item.name || item.title || 'Untitled'
      }));
      set({ guestId: gId, exams: cleanExams, currentStep: 'exam', isLoading: false });
    } catch (error) {
      console.error("Session initialization failed:", error);
      set({ isLoading: false });
    }
  },

  selectExam: async (id: string | number, name: string) => {
    if (!id || id === 'undefined') return;
    set({ selectedExam: name, isLoading: true });
    try {
      const res = await axios.get(`http://localhost:8000/exams/${id}`);
      const rawSubjects = Array.isArray(res.data) ? res.data : (res.data?.subjects || res.data?.data || []);
      const cleanSubjects = (rawSubjects as RawBackendItem[]).map((item) => ({
        id: item.subject_id || item.id || item._id || '',
        name: item.name || item.title || 'Untitled'
      }));
      set({ subjects: cleanSubjects, currentStep: 'subject', isLoading: false });
    } catch (error) {
      console.error("Failed to fetch subjects for selected exam:", error);
      set({ isLoading: false });
    }
  },

  selectSubject: async (id: string | number, name: string) => {
    if (!id || id === 'undefined') return;
    set({ selectedSubject: name, isLoading: true });
    try {
      const res = await axios.get(`http://localhost:8000/subjects/${id}`);
      const rawChapters = Array.isArray(res.data) ? res.data : (res.data?.chapters || res.data?.data || []);
      const cleanChapters = (rawChapters as RawBackendItem[]).map((item) => ({
        id: item.chapter_id || item.id || item._id || '',
        name: item.name || item.title || 'Untitled'
      }));
      set({ chapters: cleanChapters, currentStep: 'chapter', isLoading: false });
    } catch (error) {
      console.error("Failed to fetch chapters for selected subject:", error);
      set({ isLoading: false });
    }
  },

  // 3. Select Chapter Workflow: Connects the sequential APIs up to starting an active attempt session
  selectChapter: async (id: string | number, name: string) => {
    if (!id || id === 'undefined') return;
    set({ selectedChapter: name, isLoading: true, currentQuestionIndex: 0, responses: [], quizResult: null });
    
    try {
      // Step A: Fetch Chapter to extract the attached Quiz Reference ID
      const chapterRes = await axios.get(`http://localhost:8000/chapters/${id}`);
      const extractedQuizId = chapterRes.data.quiz_id || "quiz_adv_2026_8646e2"; // Graceful fallback string

      // Step B: Fetch the underlying list of questions contained inside that Quiz
      const quizRes = await axios.get(`http://localhost:8000/quizzes/${extractedQuizId}`);
      const fetchedQuestions = quizRes.data.questions || [];

      // Step C: Initialize the structural live session registry with the backend
      const startPayload = {
        student_id: get().guestId || "anonymous_guest",
        quiz_id: extractedQuizId
      };
      const attemptRes = await axios.post('http://localhost:8000/attempts/start', startPayload);
      const serverAttemptId = attemptRes.data.attempt_id;

      set({
        quizId: extractedQuizId,
        questions: fetchedQuestions,
        attemptId: serverAttemptId,
        currentStep: 'quiz',
        isLoading: false
      });
    } catch (error) {
      console.error("Failed to compile quiz session parameters:", error);
      set({ isLoading: false });
    }
  },

  // 4. One-by-One Response Evaluator: Aggregates answers and processes ultimate payload execution
  submitAnswer: async (selectedOption: string | null, isSkipped: boolean) => {
    const { questions, currentQuestionIndex, responses, attemptId } = get();
    const currentQuestion = questions[currentQuestionIndex];

    // Formulate clean structured response object for the active question node
    const newResponse: UserResponse = {
      question_id: currentQuestion.question_id,
      selected_option: selectedOption,
      is_skipped: isSkipped
    };

    const updatedResponses = [...responses, newResponse];
    set({ responses: updatedResponses });

    // Boundary validation: Check if more questions are left inside the queue array
    if (currentQuestionIndex + 1 < questions.length) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    } else {
      // Terminus node hit: Execute final submission payload directly to the repository
      set({ isLoading: true });
      try {
        const finalSubmissionBody = {
          attempt_id: attemptId,
          responses: updatedResponses
        };

        const resultRes = await axios.post('http://localhost:8000/attempts/submit', finalSubmissionBody);
        
        set({
          quizResult: resultRes.data,
          currentStep: 'result',
          isLoading: false
        });
      } catch (error) {
        console.error("Error submitting test results payload:", error);
        set({ currentStep: 'result', isLoading: false });
      }
    }
  },

  goBack: () => {
    const { currentStep } = get();
    if (currentStep === 'exam') {
      set({ currentStep: 'welcome', selectedExam: null });
    } else if (currentStep === 'subject') {
      set({ currentStep: 'exam', selectedExam: null, subjects: [] });
    } else if (currentStep === 'chapter') {
      set({ currentStep: 'subject', selectedSubject: null, chapters: [] });
    } else if (currentStep === 'quiz') {
      set({ currentStep: 'chapter', questions: [], currentQuestionIndex: 0, responses: [] });
    } else if (currentStep === 'result') {
      set({ currentStep: 'chapter', quizResult: null, questions: [], currentQuestionIndex: 0, responses: [] });
    }
  }
}));