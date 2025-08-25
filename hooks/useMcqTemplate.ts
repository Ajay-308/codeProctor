"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import type { Id } from "@/convex/_generated/dataModel";

interface MCQQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
  explanation?: string;
}

interface MCQTemplate {
  _id?: Id<"mcqTemplates">;
  title: string;
  description: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number;
  passingScore: number;
  questions: MCQQuestion[];
  tags: string[];
  totalPoints: number;
  usageCount?: number;
  createdBy?: string;
  createdAt?: number;
  updatedAt?: number;
}

interface ScheduleData {
  candidateEmails: string[];
  dueDate: Date;
  instructions: string;
  sendImmediately: boolean;
  reminderEnabled: boolean;
}

interface BackendQuestion {
  id: string;
  type: "single" | "multiple";
  question: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  explanation?: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}
export function useMCQTemplates() {
  const { user } = useUser();
  const [isCreating, setIsCreating] = useState(false);

  const templates = useQuery(api.mcqTemplate.getMCQTemplates);
  const createTemplate = useMutation(api.mcqTemplate.createMCQTemplate);
  const updateTemplate = useMutation(api.mcqTemplate.updateMCQTemplate);
  const deleteTemplate = useMutation(api.mcqTemplate.deleteMCQTemplate);
  const duplicateTemplate = useMutation(api.mcqTemplate.duplicateMCQTemplate);
  const createAssignment = useMutation(api.mcqAssignment.createMCQAssignment);

  const transformQuestionsForBackend = (
    questions: MCQQuestion[],
    category: string,
    difficulty: "easy" | "medium" | "hard"
  ): BackendQuestion[] => {
    return questions.map((q, idx) => ({
      id: `${idx}`,
      type: "single",
      question: q.question,
      category,
      difficulty,
      points: q.points,
      explanation: q.explanation,
      options: q.options.map((opt, optIdx) => ({
        id: `${idx}-${optIdx}`,
        text: opt,
        isCorrect: q.correctAnswer === optIdx,
      })),
    }));
  };

  const handleCreateTemplate = async (
    templateData: MCQTemplate
  ): Promise<Id<"mcqTemplates"> | undefined> => {
    if (!user) {
      toast.error("You must be logged in to create templates");
      return;
    }

    try {
      const transformedQuestions = transformQuestionsForBackend(
        templateData.questions,
        templateData.category,
        templateData.difficulty
      );

      const templateId = await createTemplate({
        title: templateData.title,
        description: templateData.description,
        category: templateData.category,
        difficulty: templateData.difficulty,
        timeLimit: templateData.timeLimit,
        passingScore: templateData.passingScore,
        totalPoints: templateData.totalPoints,
        tags: templateData.tags,
        questions: transformedQuestions,
        createdBy: user.id,
      });

      toast.success(`Template "${templateData.title}" created successfully!`);
      return templateId;
    } catch (error) {
      toast.error("Failed to create template");
      console.error("handleCreateTemplate:", error);
      throw error;
    }
  };

  const handleUpdateTemplate = async (
    id: Id<"mcqTemplates">,
    updates: Partial<MCQTemplate>
  ): Promise<void> => {
    try {
      const { questions, ...rest } = updates;

      const backendUpdates = {
        ...rest,
        ...(questions && {
          questions: transformQuestionsForBackend(
            questions,
            updates.category ?? "General",
            (updates.difficulty ?? "easy") as "easy" | "medium" | "hard"
          ),
        }),
      };

      await updateTemplate({ id, updates: backendUpdates });
      toast.success("Template updated successfully!");
    } catch (error) {
      toast.error("Failed to update template");
      console.error("handleUpdateTemplate:", error);
      throw error;
    }
  };

  const handleDeleteTemplate = async (
    id: Id<"mcqTemplates">,
    title: string
  ): Promise<void> => {
    try {
      await deleteTemplate({ id });
      toast.success(`Template "${title}" deleted`);
    } catch (error) {
      toast.error("Failed to delete template");
      console.error("handleDeleteTemplate:", error);
      throw error;
    }
  };

  const handleDuplicateTemplate = async (
    id: Id<"mcqTemplates">,
    title: string
  ): Promise<Id<"mcqTemplates"> | undefined> => {
    try {
      const newId = await duplicateTemplate({ id });
      toast.success(`Template "${title}" duplicated`);
      return newId;
    } catch (error) {
      toast.error("Failed to duplicate template");
      console.error("handleDuplicateTemplate:", error);
      throw error;
    }
  };

  const createAssignmentFromTemplate = async (
    template: MCQTemplate,
    schedule: ScheduleData
  ): Promise<Id<"mcqAssignments"> | undefined> => {
    if (!user || !template._id) {
      toast.error("Invalid template or user");
      return;
    }

    setIsCreating(true);
    try {
      const assignmentId = await createAssignment({
        templateId: template._id,
        title: `${template.title} - Assessment`,
        description: template.description,
        candidateEmails: schedule.candidateEmails,
        dueDate: schedule.dueDate.getTime(),
        instructions: schedule.instructions,
        sendImmediately: schedule.sendImmediately,
        reminderEnabled: schedule.reminderEnabled,
        createdBy: user.id,
      });

      toast.success(
        `Assignment sent to ${schedule.candidateEmails.length} candidate(s)!`
      );
      return assignmentId;
    } catch (error) {
      toast.error("Failed to create assignment");
      console.error("createAssignmentFromTemplate:", error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    templates,
    isCreating,
    createTemplate: handleCreateTemplate,
    updateTemplate: handleUpdateTemplate,
    deleteTemplate: handleDeleteTemplate,
    duplicateTemplate: handleDuplicateTemplate,
    createAssignmentFromTemplate,
  };
}
