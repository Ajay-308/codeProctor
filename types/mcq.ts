// types/mcq.ts
import type { Id } from "@/convex/_generated/dataModel";

export interface MCQTemplate {
  _id: Id<"mcqTemplates">;
  title: string;
  description: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number;
  passingScore: number;
  questions: {
    question: string;
    options: string[];
    answer: string | number;
    points: number;
    [key: string]: unknown;
  }[];
  tags: string[];
  totalPoints: number;
  usageCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface MCQQuestion {
  question: string;
  options: string[];
  answer: string | number;
  points: number;
  [key: string]: unknown; // allows extra fields like id, type, etc.
}

export interface NormalizedMCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
}
export interface NormalizedMCQQuestion {
  id?: string;
  question: string;
  options: NormalizedMCQOption[];
  answer?: string | number | null; // optional or null if not answered yet
  correctAnswer?: string | number; // optional legacy support
  points: number;
  [key: string]: unknown;
}

export interface CodingTemplate {
  _id?: string;
  title: string;
  description?: string;
  tags: string[];
  difficulty: "easy" | "medium" | "hard" | "expert";
  language: string;
  timeLimit: number;
  usageCount: number;
  updatedAt: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  sampleInput?: string;
  sampleOutput?: string;
  explanation?: string;
}
