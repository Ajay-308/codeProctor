"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import CandidateMCQAssessment from "@/components/candidate-mcq-assignment";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertTriangle } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

type MCQAnswer = {
  questionId: string;
  selectedOptions: string[]; // Corrected from selectedOption
  flagged: boolean;
};

export default function CandidateAssessmentPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const assignmentId = params?.id as Id<"mcqAssignments">;
  const candidateEmail = searchParams?.get("email") || "";

  const candidateAssignment = useQuery(
    api.mcqAssignments.getCandidateAssignment,
    assignmentId && candidateEmail ? { assignmentId, candidateEmail } : "skip"
  );

  const startAssignment = useMutation(api.mcqAssignments.startAssignment);
  const submitAssignment = useMutation(api.mcqAssignments.submitAssignment);

  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (candidateAssignment?.status === "in_progress") {
      setHasStarted(true);
    }
  }, [candidateAssignment]);

  const handleStartAssessment = async () => {
    try {
      await startAssignment({ assignmentId, candidateEmail });
      setHasStarted(true);
    } catch (error) {
      console.error("Failed to start assessment:", error);
    }
  };

  const handleSubmitAssessment = async (
    answers: MCQAnswer[],
    timeSpent: number
  ) => {
    try {
      const result = await submitAssignment({
        assignmentId,
        candidateEmail,
        answers,
        timeSpent,
      });

      console.log("Assessment submitted:", result);
    } catch (error) {
      console.error("Failed to submit assessment:", error);
    }
  };

  // ------------------- Loading -------------------
  if (candidateAssignment === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <h3 className="text-lg font-medium mb-2">Loading Assessment</h3>
            <p className="text-sm text-muted-foreground text-center">
              Please wait while we prepare your assessment...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ------------------- Not Found or Expired -------------------
  if (!candidateAssignment || !candidateAssignment.assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Assessment Not Found</h3>
            <p className="text-sm text-muted-foreground text-center">
              The assessment you&#39;re looking for could not be found or may
              have expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ------------------- Already Completed -------------------
  if (candidateAssignment.status === "completed") {
    const passed =
      candidateAssignment.score! >= candidateAssignment.assignment.passingScore;
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Assessment Completed</h2>
            <p className="text-muted-foreground mb-4">
              You have already submitted this assessment.
            </p>
            {candidateAssignment.score !== null && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Your Score:</span>
                  <span className="font-medium">
                    {candidateAssignment.score.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span
                    className={`font-medium ${passed ? "text-green-600" : "text-red-600"}`}
                  >
                    {passed ? "Passed" : "Failed"}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ------------------- Start Screen -------------------
  if (candidateAssignment.status === "pending" && !hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {candidateAssignment.assignment.title}
                </h1>
                <p className="text-muted-foreground">
                  {candidateAssignment.assignment.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {candidateAssignment.assignment.questions.length}
                  </div>
                  <div className="text-sm text-blue-600">Questions</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {candidateAssignment.assignment.timeLimit}
                  </div>
                  <div className="text-sm text-green-600">Minutes</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {candidateAssignment.assignment.passingScore}%
                  </div>
                  <div className="text-sm text-purple-600">Passing Score</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-left bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-800 mb-2">
                    Instructions:
                  </h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>
                      • Read each question carefully before selecting your
                      answer
                    </li>
                    <li>
                      • You can flag questions for review and come back to them
                      later
                    </li>
                    <li>
                      • Make sure to submit your assessment before the time runs
                      out
                    </li>
                    <li>• Once submitted, you cannot change your answers</li>
                  </ul>
                </div>

                <button
                  onClick={handleStartAssessment}
                  className="w-full bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Start Assessment
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ------------------- Active Assessment -------------------
  const assessmentData = {
    id: candidateAssignment.assignment._id,
    title: candidateAssignment.assignment.title,
    description: candidateAssignment.assignment.description,
    timeLimit: candidateAssignment.assignment.timeLimit,
    passingScore: candidateAssignment.assignment.passingScore,
    questions: candidateAssignment.assignment.questions,
    totalPoints: candidateAssignment.assignment.totalPoints,
  };

  return (
    <CandidateMCQAssessment
      assessment={assessmentData}
      onSubmit={handleSubmitAssessment}
      candidateName={candidateEmail.split("@")[0]}
    />
  );
}
