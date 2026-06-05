/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ManagedExam, LeaderboardEntry, DailyAnalysis, RecentActivityLog } from "./types";

// Pre-seeded Weekly Activity Analysis Data for Read-only dashboard
export const WEEKLY_ANALYSIS_DATA: DailyAnalysis[] = [
  { dayName: "Mon", activeUsers: 4200, attempts: 5120, completed: 4800, pending: 320 },
  { dayName: "Tue", activeUsers: 5900, attempts: 7200, completed: 6800, pending: 400 },
  { dayName: "Wed", activeUsers: 7100, attempts: 8900, completed: 8350, pending: 550 },
  { dayName: "Thu", activeUsers: 6800, attempts: 8100, completed: 7600, pending: 500 },
  { dayName: "Fri", activeUsers: 8200, attempts: 10400, completed: 9800, pending: 600 },
  { dayName: "Sat", activeUsers: 10500, attempts: 12800, completed: 12100, pending: 700 },
  { dayName: "Sun", activeUsers: 11800, attempts: 14500, completed: 13900, pending: 600 }
];

// Pre-seeded Recent user activity logs using exclusively auto-generated Generic User ID's
export const INITIAL_RECENT_LOGS: RecentActivityLog[] = [
  {
    id: "log-1",
    userId: 10482,
    examName: "UPSC Civil Services",
    subjectName: "General Studies",
    chapterTitle: "Preamble & Polity Core",
    status: "Completed",
    timestamp: "Today, 10:48 AM"
  },
  {
    id: "log-2",
    userId: 11094,
    examName: "Staff Selection (SSC)",
    subjectName: "Quantitative Aptitude",
    chapterTitle: "Compound Interest Formulas",
    status: "In Progress",
    timestamp: "Today, 09:12 AM"
  },
  {
    id: "log-3",
    userId: 10834,
    examName: "Tech Development Pack",
    subjectName: "React Engineering",
    chapterTitle: "Advanced Hooks & Portals",
    status: "Completed",
    timestamp: "Yesterday, 04:30 PM"
  },
  {
    id: "log-4",
    userId: 12140,
    examName: "Banking Aptitude (IBPS)",
    subjectName: "Logical Reasoning",
    chapterTitle: "Data Interpretation Basics",
    status: "Content Missing",
    timestamp: "Yesterday, 01:15 PM"
  },
  {
    id: "log-5",
    userId: 10043,
    examName: "Tech Development Pack",
    subjectName: "TypeScript Core",
    chapterTitle: "Mapped & Utility Generics",
    status: "Completed",
    timestamp: "Jun 04, 2026"
  }
];

// Leaderboard entries contain only userId (no personal details)
export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userId: 10482, xp: 9550, level: 15, streak: 28, track: "Tech Dev Pack" },
  { rank: 2, userId: 11309, xp: 8120, level: 12, streak: 19, track: "UPSC Preparations" },
  { rank: 3, userId: 10043, xp: 7500, level: 11, streak: 16, track: "Tech Dev Pack" },
  { rank: 4, userId: 10834, xp: 6320, level: 9, streak: 11, track: "SSC Preparations" },
  { rank: 5, userId: 12140, xp: 5840, level: 8, streak: 9, track: "Banking General" },
  { rank: 6, userId: 11094, xp: 4120, level: 6, streak: 5, track: "SSC Preparations" }
];

// Complete Curriculum Database Hierarchical Flow:
// EXAM -> SUBJECT -> CHAPTER -> QUIZ -> QUESTIONS
export const INITIAL_EXAMS: ManagedExam[] = [
  {
    id: "ex-upsc",
    name: "UPSC Civil Services",
    code: "UPSC",
    subjects: [
      {
        id: "sub-polity",
        name: "General Studies — Indian Polity",
        chapters: [
          {
            id: "ch-polity-1",
            title: "1. The Preamble of the Constitution",
            description: "Learn about the sovereign, socialist, secular, democratic, republic keys, liberty, and integrity framework.",
            quizzes: [
              {
                id: "quiz- preamble",
                title: "Preamble Fundamentals",
                description: "Test critical queries about sovereignty and amendments.",
                xpReward: 350,
                questions: [
                  {
                    id: "q-pr-1",
                    questionText: "Which Constitutional Amendment added the terms 'Secular' and 'Socialist'?",
                    options: [
                      "42nd Amendment (1976)",
                      "44th Amendment (1978)",
                      "24th Amendment (1971)",
                      "86th Amendment (2002)"
                    ],
                    correctIndex: 0,
                    explanation: "The 42nd Amendment is commonly known as the 'Mini-Constitution' which added 'Socialist', 'Secular', and 'Integrity' to the Preamble."
                  },
                  {
                    id: "q-pr-2",
                    questionText: "Is the Preamble considered a part of the Constitution according to the Supreme Court Landmark Case?",
                    options: [
                      "No, declared in Kesavananda Bharati Cases",
                      "Yes, conclusively established in Kesavananda Bharati Cases (1973)",
                      "It was only recognized in Berubari Union case (1960)",
                      "It is an optional appendix without lawful context"
                    ],
                    correctIndex: 1,
                    explanation: "In Kesavananda Bharati Sripadagalvaru v. State of Kerala, the Supreme Court overruled Berubari, stating the Preamble is an integral pillar."
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: "sub-history",
        name: "GS History — Freedom Struggle",
        chapters: [
          {
            id: "ch-hist-1",
            title: "1. The Revolt of 1857",
            description: "Study key factors of the sepoy mutiny, local leaders, state actions, and general governance aftermath.",
            quizzes: [
              {
                id: "quiz-1857",
                title: "Revolt Leaders & Causes",
                description: "Review military and commercial factors.",
                xpReward: 250,
                questions: [
                  {
                    id: "q-hi-1",
                    questionText: "Who led the Revolt of 1857 at Kanpur?",
                    options: [
                      "Kunwar Singh",
                      "Nana Sahib",
                      "Begum Hazrat Mahal",
                      "Rani Laxmibai"
                    ],
                    correctIndex: 1,
                    explanation: "Nana Sahib led the uprising at Kanpur with Tatya Tope, while Kunwar Singh led in Bihar."
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "ex-tech",
    name: "Tech Development Premium Pack",
    code: "TECH-DEV",
    subjects: [
      {
        id: "sub-ts",
        name: "TypeScript Advanced Principles",
        chapters: [
          {
            id: "ch-ts-1",
            title: "1. Mapped Types & Advanced Generics",
            description: "Explore the utility tokens, key modifiers, conditional queries, and infer keywords.",
            quizzes: [
              {
                id: "quiz-ts-generics",
                title: "Mapped Types & Generics",
                description: "Challenge your command layout on conditional typing constructs.",
                xpReward: 400,
                questions: [
                  {
                    id: "q-ts-1",
                    questionText: "What does the 'keyof' index modifier do?",
                    options: [
                      "Extracts the values of an array literal",
                      "Yields a union type representing keys of an object type",
                      "Dynamically parses JSON blocks into system declarations",
                      "Sets properties as read-only constants"
                    ],
                    correctIndex: 1,
                    explanation: "keyof T takes an object type T and returns a union type of its public string/number keys."
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "ex-banking",
    name: "Banking Aptitude (IBPS)",
    code: "BANK-PO",
    subjects: [
      {
        id: "sub-banking-quant",
        name: "Quantitative Aptitude Formulas",
        chapters: [
          {
            id: "ch-bank-1",
            title: "1. Interest Rates & Proportions",
            description: "Formulate compounds, simple percentage margins, and ratio balances.",
            quizzes: [
              {
                id: "quiz-interest",
                title: "Compound Calculations",
                description: "Verify formula execution speeds.",
                xpReward: 200,
                questions: [
                  {
                    id: "q-b-1",
                    questionText: "What is the Compound Interest formula for yearly yields?",
                    options: [
                      "A = P * (1 + R/100)^N",
                      "A = P * R * T / 100",
                      "A = P + (R * T)^2",
                      "A = P / (1 - R/100)^N"
                    ],
                    correctIndex: 0,
                    explanation: "A = P(1 + R/100)^N yields the combined principal and interest accumulation."
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];
