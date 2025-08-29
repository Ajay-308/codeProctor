"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface MCQQuestion {
  id: string;
  question: string;
  options: MCQOption[];
  type: "single" | "multiple";
  points: number;
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
}

interface MCQAssessment {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  questions: MCQQuestion[];
  totalPoints: number;
}

interface CandidateAnswer {
  questionId: string;
  selectedOptions: string[];
  flagged: boolean;
}

interface CandidateMCQAssessmentProps {
  assessment: MCQAssessment;
  onSubmit: (answers: CandidateAnswer[], timeSpent: number) => void;
  candidateName?: string;
}

export default function CandidateMCQAssessment({
  assessment,
  onSubmit,
  candidateName = "Candidate",
}: CandidateMCQAssessmentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<CandidateAnswer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(assessment.timeLimit * 60);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [startTime] = useState(Date.now());

  const currentQuestion = assessment.questions[currentQuestionIndex];
  const currentAnswer = answers.find(
    (a) => a.questionId === currentQuestion.id
  );

  // Initialize answers
  useEffect(() => {
    const initialAnswers: CandidateAnswer[] = assessment.questions.map((q) => ({
      questionId: q.id,
      selectedOptions: [],
      flagged: false,
    }));
    setAnswers(initialAnswers);
  }, [assessment.questions]);

  // Timer

  useEffect(() => {
    if (isSubmitted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line
  }, [timeRemaining, isSubmitted]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (optionId: string, checked: boolean) => {
    setAnswers((prev) =>
      prev.map((answer) => {
        if (answer.questionId === currentQuestion.id) {
          if (currentQuestion.type === "single") {
            return {
              ...answer,
              selectedOptions: checked ? [optionId] : [],
            };
          } else {
            return {
              ...answer,
              selectedOptions: checked
                ? [...answer.selectedOptions, optionId]
                : answer.selectedOptions.filter((id) => id !== optionId),
            };
          }
        }
        return answer;
      })
    );
  };

  const handleFlagQuestion = () => {
    setAnswers((prev) =>
      prev.map((answer) =>
        answer.questionId === currentQuestion.id
          ? { ...answer, flagged: !answer.flagged }
          : answer
      )
    );
  };

  const handleAutoSubmit = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    onSubmit(answers, timeSpent);
    setIsSubmitted(true);
  };

  const handleSubmit = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    onSubmit(answers, timeSpent);
    setIsSubmitted(true);
    setShowSubmitDialog(false);
  };

  const getAnsweredCount = () => {
    return answers.filter((a) => a.selectedOptions.length > 0).length;
  };

  const getFlaggedCount = () => {
    return answers.filter((a) => a.flagged).length;
  };

  const getProgressPercentage = () => {
    return (getAnsweredCount() / assessment.questions.length) * 100;
  };

  const canGoNext = () =>
    currentQuestionIndex < assessment.questions.length - 1;
  const canGoPrevious = () => currentQuestionIndex > 0;

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Assessment Submitted!</h2>
            <p className="text-muted-foreground mb-4">
              Thank you for completing the assessment. Your responses have been
              recorded.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Questions Answered:</span>
                <span className="font-medium">
                  {getAnsweredCount()}/{assessment.questions.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Time Spent:</span>
                <span className="font-medium">
                  {formatTime(Math.floor((Date.now() - startTime) / 1000))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{assessment.title}</h1>
              <p className="text-sm text-muted-foreground">
                Welcome, {candidateName}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium",
                  timeRemaining < 300
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
                )}
              >
                <Clock className="h-4 w-4" />
                {formatTime(timeRemaining)}
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowSubmitDialog(true)}
              >
                <Send className="h-4 w-4 mr-2" />
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Progress</CardTitle>
                <Progress value={getProgressPercentage()} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {getAnsweredCount()}/{assessment.questions.length} answered
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-5 gap-1">
                  {assessment.questions.map((_, index) => {
                    const answer = answers.find(
                      (a) => a.questionId === assessment.questions[index].id
                    );
                    const isAnswered =
                      (answer?.selectedOptions?.length ?? 0) > 0;
                    const isFlagged = answer?.flagged;
                    const isCurrent = index === currentQuestionIndex;

                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={cn(
                          "aspect-square text-xs font-medium rounded border-2 transition-all relative",
                          isCurrent && "ring-2 ring-blue-500 ring-offset-1",
                          isAnswered
                            ? "bg-green-100 border-green-300 text-green-700 hover:bg-green-200"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                        )}
                      >
                        {index + 1}
                        {isFlagged && (
                          <Flag className="h-2 w-2 text-orange-500 absolute -top-1 -right-1" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-100 border border-green-300 rounded" />
                    <span>Answered ({getAnsweredCount()})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded" />
                    <span>
                      Not Answered (
                      {assessment.questions.length - getAnsweredCount()})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flag className="h-3 w-3 text-orange-500" />
                    <span>Flagged ({getFlaggedCount()})</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">
                        Question {currentQuestionIndex + 1} of{" "}
                        {assessment.questions.length}
                      </Badge>
                      <Badge variant="secondary">
                        {currentQuestion.points} points
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          currentQuestion.difficulty === "easy" &&
                            "border-green-500 text-green-700",
                          currentQuestion.difficulty === "medium" &&
                            "border-yellow-500 text-yellow-700",
                          currentQuestion.difficulty === "hard" &&
                            "border-red-500 text-red-700"
                        )}
                      >
                        {currentQuestion.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-relaxed">
                      {currentQuestion.question}
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFlagQuestion}
                    className={cn(
                      "ml-4",
                      currentAnswer?.flagged && "text-orange-600 bg-orange-50"
                    )}
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {currentQuestion.type === "single" ? (
                    <RadioGroup
                      value={currentAnswer?.selectedOptions[0] || ""}
                      onValueChange={(value) => handleAnswerChange(value, true)}
                    >
                      {currentQuestion.options.map((option, index) => (
                        <div
                          key={option.id}
                          className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                        >
                          <RadioGroupItem value={option.id} id={option.id} />
                          <Label
                            htmlFor={option.id}
                            className="flex-1 cursor-pointer"
                          >
                            <span className="font-medium mr-2">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, index) => (
                        <div
                          key={option.id}
                          className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                        >
                          <Checkbox
                            id={option.id}
                            checked={
                              currentAnswer?.selectedOptions.includes(
                                option.id
                              ) || false
                            }
                            onCheckedChange={(checked) =>
                              handleAnswerChange(option.id, checked as boolean)
                            }
                          />
                          <Label
                            htmlFor={option.id}
                            className="flex-1 cursor-pointer"
                          >
                            <span className="font-medium mr-2">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                    disabled={!canGoPrevious()}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  <div className="text-sm text-muted-foreground">
                    {currentQuestion.type === "single"
                      ? "Select one answer"
                      : "Select all that apply"}
                  </div>

                  <Button
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    disabled={!canGoNext()}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Assessment</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your assessment? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-medium text-yellow-800">
                    Review your answers
                  </h4>
                  <div className="text-sm text-yellow-700 space-y-1">
                    <div>
                      • Answered: {getAnsweredCount()}/
                      {assessment.questions.length} questions
                    </div>
                    <div>
                      • Unanswered:{" "}
                      {assessment.questions.length - getAnsweredCount()}{" "}
                      questions
                    </div>
                    <div>
                      • Flagged for review: {getFlaggedCount()} questions
                    </div>
                    <div>• Time remaining: {formatTime(timeRemaining)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowSubmitDialog(false)}
              >
                Continue Working
              </Button>
              <Button onClick={handleSubmit}>Submit Assessment</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
