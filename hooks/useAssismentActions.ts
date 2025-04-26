"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";

export const useAssignmentActions = () => {
  const createAssignment = useMutation(api.assignments.createAssignment);
  const { userId } = useAuth();
  const router = useRouter();

  const createNewAssignment = async ({
    title,
    description,
    dueDate,
  }: {
    title: string;
    description?: string;
    dueDate: number; // timestamp
  }) => {
    try {
      const assignmentId = await createAssignment({
        title,
        description,
        dueDate,
        createdBy: userId ?? "",
        passingScore: 0, // Default passing score
        questions: [],
      });

      toast.success("Assignment created successfully");
      router.push(`/assignment/${assignmentId}`);
    } catch (err) {
      console.error("Failed to create assignment", err);
      toast.error("Failed to create assignment");
    }
  };

  return {
    createNewAssignment,
  };
};
