/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Generic User Stats & Identity (Only has user_id, XP, level, etc.)
export interface UserStats {
  userId: number; // e.g. 10234
  track: string;  // e.g. UPSC prep, Banking, Tech
  totalXp: number;
  level: number;
  streak: number;
  quizzesCompleted: number;
  chaptersCompleted: number;
  questionsSolved: number;
}

export interface ProfileStats {
  totalXp: number;
  level: number;
  streak: number;
  quizzesCompleted: number;
  chaptersCompleted: number;
  questionsSolved: number;
  weeklyXp: number[];
}

export interface UserProfile {
  email: string;
  name: string;
  avatar: string;
  track: string;
  bio: string;
  stats: ProfileStats;
  badges?: [];
}

// Global analytical snapshot for Admin/Developer review 
export interface DailyAnalysis {
  dayName: string; // "Mon", "Tue", etc.
  activeUsers: number;
  attempts: number;
  completed: number;
  pending: number;
}

// Simplified Leaderboard using exclusively Generic user_ids
export interface LeaderboardEntry {
  rank: number;
  userId: number; // strictly user ID, nothing else
  xp: number;
  level: number;
  streak: number;
  track: string;
}

// Managed Exams Curriculum Hierarchical Flow:
// EXAM -> SUBJECT -> CHAPTER -> QUIZ -> QUESTIONS
export interface ManagedQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ManagedQuiz {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  questions: ManagedQuestion[];
  isCompleted?: boolean;
}

export interface ManagedChapter {
  id: string;
  title: string;
  description: string;
  quizzes: ManagedQuiz[];
  isCompleted?: boolean;
}

export interface ManagedSubject {
  id: string;
  name: string;
  chapters: ManagedChapter[];
}

export interface ManagedExam {
  id: string;
  name: string;
  code: string; // e.g. UPSC, SSC, Banking, Tech
  subjects: ManagedSubject[];
}

export interface RecentActivityLog {
  id: string;
  userId: number;
  examName: string;
  subjectName: string;
  chapterTitle: string;
  status: "Completed" | "In Progress" | "Content Missing";
  timestamp: string;
}
