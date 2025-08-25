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

export interface NormalizedMCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export type NormalizedMCQQuestion = {
  id: string;
  type: "single" | "multiple";
  difficulty: "easy" | "medium" | "hard";
  category: string;
  question: string;
  answer: string | number;
  points: number;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
};

export type MCQAnswer = {
  questionId: string;
  selectedOptions: string[];
  flagged: boolean;
};
