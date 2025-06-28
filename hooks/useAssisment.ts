"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import type { Id } from "@/convex/_generated/dataModel";

// ----------------------------
// Type Definitions
// ----------------------------
interface MCQAnswer {
  questionId: string;
  selectedOption: string;
}

interface CodingTemplateInput {
  explanation?: string;
  usageCount?: number;
  createdAt?: string;
  updatedAt?: string;
  inputFormat?: string;
  outputFormat?: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard" | "expert";
  tags: string[];
  testCases: {
    input: string;
    output: string;
  }[];
  language: string;
  timeLimit: number; // Added required property
}

// ----------------------------
// MCQ Assignment Hook
// ----------------------------
export function useMCQAssignments() {
  const { user } = useUser();

  const assignments = useQuery(
    api.mcqAssignment.getMCQAssignments,
    user ? { createdBy: user.id } : "skip"
  );

  const startAssignment = useMutation(api.mcqAssignment.startAssignment);
  const submitAssignment = useMutation(api.mcqAssignment.submitAssignment);

  const handleStartAssignment = async (
    assignmentId: Id<"mcqAssignments">,
    candidateEmail: string
  ) => {
    try {
      await startAssignment({ assignmentId, candidateEmail });
      toast.success("Assignment started!");
    } catch (error) {
      toast.error("Failed to start assignment");
      console.error("Failed to start assignment", error);
      throw error;
    }
  };

  const handleSubmitAssignment = async (
    assignmentId: Id<"mcqAssignments">,
    candidateEmail: string,
    answers: MCQAnswer[],
    timeSpent: number
  ) => {
    try {
      const result = await submitAssignment({
        assignmentId,
        candidateEmail,
        answers: answers.map((a) => ({
          questionId: a.questionId,
          selectedOptions: [a.selectedOption],
          flagged: false,
        })),
        timeSpent,
      });

      toast.success(
        `Assignment submitted! Score: ${result.score.toFixed(1)}% ${result.passed ? "(Passed)" : "(Failed)"}`
      );

      return result;
    } catch (error) {
      toast.error("Failed to submit assignment");
      console.error("Failed to submit assignment", error);
      throw error;
    }
  };

  return {
    assignments,
    startAssignment: handleStartAssignment,
    submitAssignment: handleSubmitAssignment,
  };
}

// ----------------------------
// Coding Template Assignment Hook
// ----------------------------
export function useTemplateAssignment() {
  const createAssignment = useMutation(api.templets.addTempletes);

  const createAssignmentFromTemplate = async (
    template: CodingTemplateInput
  ) => {
    try {
      await createAssignment({
        ...template,
        timeLimit: template.timeLimit ?? 60,
      });
      await createAssignment(template);
      toast.success("Coding assignment created!");
    } catch (error) {
      toast.error("Failed to create coding assignment");
      console.error("createAssignmentFromTemplate error:", error);
      throw error;
    }
  };

  return {
    createAssignmentFromTemplate,
    isCreating: false, // You can replace with a loading state if needed
  };
}
