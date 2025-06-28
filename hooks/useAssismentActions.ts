"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";

interface Template {
  _id: string;
  title: string;
  description?: string;
  tags: string[];
  difficulty: "easy" | "medium" | "hard" | "expert";
  language: string;
  timeLimit: number;
  usageCount: number;
  updatedAt: string;
  createdAt: string;
  // Enhanced fields that match your modal
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  sampleInput?: string;
  sampleOutput?: string;
  explanation?: string;
  // Additional LeetCode fields
  url?: string;
  topics?: string[];
  leetcodeId?: string;
}

export function useTemplateAssignment() {
  const { user } = useUser();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const createAssignment = useMutation(api.assignments.createAssignment);

  const createAssignmentFromTemplate = async (template: Template) => {
    if (!user) {
      toast.error("You must be logged in to create assignments");
      return;
    }

    setIsCreating(true);

    try {
      // Convert template to assignment format
      const assignmentData = {
        createdBy: user.id,
        title: `${template.title} - Assignment`,
        description:
          template.description ||
          `Assignment based on ${template.title} template`,
        dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
        passingScore: 70,
        type: getAssignmentType(template.difficulty, template.language),
        timeLimit: template.timeLimit,
        status: "draft" as const,
        questions: createQuestionsFromTemplate(template),
        templateId: template._id,
        tags: template.tags,
        candidateEmails: [], // Add default empty array or appropriate value
        sendImmediately: false, // Add default value or appropriate value
        reminderEnabled: false, // Add default value or appropriate value
      };

      const assignmentId = await createAssignment(assignmentData);

      toast.success(
        `Assignment "${assignmentData.title}" created successfully!`
      );

      // Navigate to assignment details or scheduling page
      router.push(`/assignments/${assignmentId}/schedule`);
    } catch (error) {
      console.error("Error creating assignment from template:", error);
      toast.error("Failed to create assignment. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createAssignmentFromTemplate,
    isCreating,
  };
}

function getAssignmentType(difficulty: string, language: string): string {
  if (language.toLowerCase().includes("sql")) return "database";
  if (
    ["javascript", "python", "java", "cpp"].includes(language.toLowerCase())
  ) {
    return difficulty === "easy" ? "coding" : "dsa";
  }
  return "general";
}

function createQuestionsFromTemplate(template: Template) {
  return [
    {
      id: 1,
      question: template.title,
      content: buildQuestionContent(template),
      type: "coding",
      points: 100,
      options: [],
      correctAnswer: "",
      metadata: {
        language: template.language,
        difficulty: template.difficulty,
        inputFormat: template.inputFormat,
        outputFormat: template.outputFormat,
        constraints: template.constraints,
        sampleInput: template.sampleInput,
        sampleOutput: template.sampleOutput,
        explanation: template.explanation,
        tags: template.tags,
        timeLimit: template.timeLimit,
        leetcodeId: template.leetcodeId,
        url: template.url,
      },
    },
  ];
}

function buildQuestionContent(template: Template): string {
  let content = template.description || "";

  if (template.inputFormat) {
    content += `\n\n**Input Format:**\n${template.inputFormat}`;
  }

  if (template.outputFormat) {
    content += `\n\n**Output Format:**\n${template.outputFormat}`;
  }

  if (template.constraints) {
    content += `\n\n**Constraints:**\n${template.constraints}`;
  }

  if (template.sampleInput && template.sampleOutput) {
    content += `\n\n**Example:**\n\nInput:\n\`\`\`\n${template.sampleInput}\n\`\`\`\n\nOutput:\n\`\`\`\n${template.sampleOutput}\n\`\`\``;
  }

  if (template.explanation) {
    content += `\n\n**Explanation:**\n${template.explanation}`;
  }

  return content;
}
