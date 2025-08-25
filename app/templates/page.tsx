"use client";

import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreVertical,
  Copy,
  Pencil,
  Trash2,
  Search,
  Clock,
  Hash,
  Calendar,
  BarChart2,
  HelpCircle,
  Send,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { Id } from "@/convex/_generated/dataModel";

import MCQTemplateModal from "@/components/mcq-template-model";
import ScheduleAssignmentModal from "@/components/schedule-assignment-model";
import ProtectedRoute from "@/components/protectedComponent";
import Navbar from "@/components/Navbar";

import { useMCQTemplates } from "@/hooks/useMcqTemplate";
import type {
  MCQTemplate,
  NormalizedMCQOption,
  NormalizedMCQQuestion,
} from "@/types/mcq";
import type { ScheduleData } from "@/components/schedule-assignment-model";

const getBadgeVariant = (difficulty: string) => {
  switch (difficulty) {
    case "easy":
      return "secondary";
    case "medium":
      return "outline";
    case "hard":
      return "default";
    case "expert":
      return "destructive";
    default:
      return "secondary";
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "easy":
      return "bg-emerald-500";
    case "medium":
      return "bg-amber-500";
    case "hard":
      return "bg-violet-600";
    case "expert":
      return "bg-rose-600";
    default:
      return "bg-slate-500";
  }
};

export default function MCQTemplatesPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [isMCQModalOpen, setIsMCQModalOpen] = useState(false);
  const [editMCQTemplate, setEditMCQTemplate] = useState<MCQTemplate | null>(
    null
  );
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MCQTemplate | null>(
    null
  );

  // MCQ Templates Hooks
  const {
    templates: mcqTemplates,
    isCreating: isMCQCreating,
    createTemplate: createMCQTemplate,
    updateTemplate: updateMCQTemplate,
    deleteTemplate: deleteMCQTemplate,
    duplicateTemplate: duplicateMCQTemplate,
    createAssignmentFromTemplate: createMCQAssignmentFromTemplate,
  } = useMCQTemplates();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (isLoaded && !userId) {
      toast.error("You must be logged in to access this page");
      router.push("/");
    }
  }, [isLoaded, userId, router]);

  // MCQ Template Handlers
  const openMCQModal = (template: MCQTemplate | null) => {
    setEditMCQTemplate(template);
    setIsMCQModalOpen(true);
  };

  const handleSaveMCQTemplate = async (template: MCQTemplate) => {
    try {
      if (template._id) {
        await updateMCQTemplate(template._id, {
          ...template,
          questions: template.questions.map(
            (q: MCQTemplate["questions"][number]) => ({
              ...q,
              correctAnswer:
                typeof (q as { correctAnswer?: string | number })
                  .correctAnswer !== "undefined"
                  ? Number(
                      (q as { correctAnswer?: string | number }).correctAnswer
                    )
                  : typeof q.answer === "number"
                    ? q.answer
                    : !isNaN(Number(q.answer))
                      ? Number(q.answer)
                      : 0,
            })
          ),
        });
      } else {
        if (!template.title) {
          toast.error("Title is required for the MCQ template.");
          return;
        }

        await createMCQTemplate({
          ...template,
          description: template.description ?? "",
          category: template.category ?? "",
          difficulty: template.difficulty ?? "easy",
          timeLimit: template.timeLimit ?? 0,
          passingScore: template.passingScore ?? 0,
          questions: template.questions
            ? template.questions
                .map((q: MCQTemplate["questions"][number]) => ({
                  ...q,
                  correctAnswer:
                    typeof (q as { correctAnswer?: string | number })
                      .correctAnswer === "number"
                      ? Number(
                          (q as { correctAnswer?: string | number })
                            .correctAnswer
                        )
                      : typeof q.answer === "number"
                        ? Number(q.answer)
                        : 0,
                }))
                .map((q) => ({
                  ...q,
                  correctAnswer:
                    typeof q.correctAnswer === "number"
                      ? q.correctAnswer
                      : typeof q.correctAnswer === "string" &&
                          !isNaN(Number(q.correctAnswer))
                        ? Number(q.correctAnswer)
                        : 0,
                }))
            : [],
          tags: template.tags ?? [],
          totalPoints: template.totalPoints ?? 0,
          usageCount: template.usageCount ?? 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
      toast.success(`MCQ template "${template.title}" saved successfully!`);
      setIsMCQModalOpen(false);
      setEditMCQTemplate(null);
    } catch (error) {
      console.error("failed to save mcq template", error);
    }
  };

  const handleDuplicateMCQ = async (template: MCQTemplate) => {
    try {
      await duplicateMCQTemplate(template._id, template.title);
      toast.success(
        `MCQ template "${template.title}" duplicated successfully!`
      );
    } catch (error) {
      console.error("failed to duplicate mcq template", error);
    }
  };

  const handleDeleteMCQ = async (template: MCQTemplate) => {
    if (
      window.confirm(`Are you sure you want to delete "${template.title}"?`)
    ) {
      try {
        await deleteMCQTemplate(template._id, template.title);
        toast.success(`MCQ template "${template.title}" deleted successfully!`);
      } catch (error) {
        console.error("failed to delete mcq template", error);
      }
    }
  };

  const handleScheduleAssignment = (template: MCQTemplate) => {
    setSelectedTemplate(template);
    setScheduleModalOpen(true);
  };

  const handleCreateMCQAssignment = async (scheduleData: ScheduleData) => {
    if (!selectedTemplate) return;

    try {
      await createMCQAssignmentFromTemplate(
        {
          ...selectedTemplate,
          questions: selectedTemplate.questions.map((q) => ({
            ...q,
            correctAnswer:
              typeof (q as { correctAnswer?: string | number })
                .correctAnswer === "number"
                ? Number(
                    (q as { correctAnswer?: string | number }).correctAnswer
                  )
                : typeof q.answer === "number"
                  ? Number(q.answer)
                  : 0,
          })),
        },
        scheduleData
      );

      setScheduleModalOpen(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error("failed to save mcq assignment", error);
    }
  };

  // Filter templates
  const filteredMCQTemplates: MCQTemplate[] =
    mcqTemplates
      ?.filter((template) => {
        const titleMatch = template.title
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
        const descriptionMatch = template.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
        const tagsMatch = template.tags?.some((tag) =>
          tag?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return titleMatch || descriptionMatch || tagsMatch;
      })
      .map((template) => ({
        ...template,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        questions: template.questions.map((q: any) => {
          return {
            question: q.question ?? "",
            options: Array.isArray(q.options)
              ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                q.options.map((opt: any) =>
                  typeof opt === "string"
                    ? opt
                    : opt.text || opt.value || opt.label || ""
                )
              : [],
            answer:
              typeof q.answer !== "undefined"
                ? q.answer
                : typeof q.correctAnswer !== "undefined"
                  ? q.correctAnswer
                  : "",
            points: typeof q.points === "number" ? q.points : 1,
            ...q,
          };
        }),
      })) || [];

  return (
    <ProtectedRoute allowedRoles={["interviewer"]}>
      <Navbar />
      <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 min-h-screen">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-black bg-clip-text text-transparent">
              MCQ Templates
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Create and manage multiple choice question assessments
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <HelpCircle className="h-4 w-4" />
                <span>Build comprehensive assessments for candidates</span>
              </div>
            </div>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={() => openMCQModal(null)}
            className="bg-black hover:bg-gray-800 cursor-pointer text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            New MCQ Template
          </Button>
        </div>

        {/* Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              className="w-full pl-10 border-slate-200 dark:border-slate-700 rounded-lg focus-visible:ring-violet-500"
              placeholder="Search MCQ templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* MCQ Templates */}
        <div className="space-y-6">
          {filteredMCQTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <HelpCircle className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                {!mcqTemplates
                  ? "Loading templates..."
                  : mcqTemplates.length === 0
                    ? "No MCQ templates yet"
                    : "No templates found"}
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md">
                {!mcqTemplates
                  ? "Please wait while we load your templates..."
                  : mcqTemplates.length === 0
                    ? "Create your first MCQ template to start building assessments for candidates."
                    : "We couldn't find any templates matching your search criteria."}
              </p>
              {mcqTemplates && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => openMCQModal(null)}
                  className="mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  {mcqTemplates.length === 0
                    ? "Create First Template"
                    : "New Template"}
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredMCQTemplates.map((template) => (
                <Card
                  key={template._id}
                  className="overflow-hidden border-0 bg-white dark:bg-slate-800 shadow-md hover:shadow-xl transition-all duration-300 rounded-xl"
                >
                  <div
                    className={cn(
                      "h-1.5",
                      getDifficultyColor(template.difficulty)
                    )}
                  />
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge
                        variant={getBadgeVariant(template.difficulty)}
                        className="font-medium text-xs px-2.5 py-0.5 rounded-full"
                      >
                        {template.difficulty.charAt(0).toUpperCase() +
                          template.difficulty.slice(1)}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => handleDuplicateMCQ(template)}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            <span>Duplicate</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openMCQModal(template)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteMCQ(template)}
                            className="text-rose-600 focus:text-rose-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                          {template.title}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 h-8">
                          {template.description || "No description provided"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className="text-xs font-normal px-2 py-0.5"
                        >
                          {template.category}
                        </Badge>
                        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {template.timeLimit} min
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center">
                          <HelpCircle className="h-3.5 w-3.5 mr-1" />
                          <span>{template.questions.length} questions</span>
                        </div>
                        <div className="flex items-center">
                          <BarChart2 className="h-3.5 w-3.5 mr-1" />
                          <span>{template.totalPoints} points</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {template.tags.slice(0, 2).map((tag, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs font-normal px-2 py-0.5 bg-slate-50 dark:bg-slate-900"
                          >
                            <Hash className="h-3 w-3 mr-1 text-slate-400" />
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 2 && (
                          <Badge
                            variant="outline"
                            className="text-xs font-normal px-2 py-0.5 bg-slate-50 dark:bg-slate-900"
                          >
                            +{template.tags.length - 2} more
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center">
                          <BarChart2 className="h-3.5 w-3.5 mr-1.5" />
                          <span>Used {template.usageCount} times</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1.5" />
                          <span>
                            {new Date(template.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="px-4 py-3 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 px-2 cursor-pointer bg-transparent"
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      Preview
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="text-xs h-7 cursor-pointer px-2 bg-black hover:bg-gray-800 border-0"
                      onClick={() => handleScheduleAssignment(template)}
                      disabled={isMCQCreating}
                    >
                      {isMCQCreating ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1" />
                      ) : (
                        <Send className="mr-1 h-3 w-3" />
                      )}
                      {isMCQCreating ? "Creating..." : "Send to Candidates"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* MCQ Template Modal */}
        <MCQTemplateModal
          open={isMCQModalOpen}
          setOpen={setIsMCQModalOpen}
          template={
            editMCQTemplate
              ? {
                  ...editMCQTemplate,
                  questions: editMCQTemplate.questions.map(
                    (q, idx): NormalizedMCQQuestion => {
                      const questionId =
                        (q as { id?: string }).id ?? idx.toString();
                      const rawType = (q as { type?: string }).type ?? "single";
                      const questionType: "single" | "multiple" =
                        rawType === "multiple" ? "multiple" : "single";

                      const allowedDifficulties = [
                        "easy",
                        "medium",
                        "hard",
                      ] as const;
                      const rawDifficulty =
                        (q as { difficulty?: string }).difficulty ??
                        editMCQTemplate.difficulty ??
                        "easy";
                      const questionDifficulty: "easy" | "medium" | "hard" =
                        allowedDifficulties.includes(
                          rawDifficulty as (typeof allowedDifficulties)[number]
                        )
                          ? (rawDifficulty as "easy" | "medium" | "hard")
                          : "easy";

                      const questionCategory =
                        (q as { category?: string }).category ??
                        editMCQTemplate.category ??
                        "";

                      const normalizedOptions: NormalizedMCQOption[] =
                        Array.isArray(q.options)
                          ? q.options.map(
                              (
                                opt:
                                  | string
                                  | {
                                      value?: string;
                                      label?: string;
                                      id?: string;
                                      isCorrect?: boolean;
                                    },
                                oidx: number
                              ) => {
                                const isString = typeof opt === "string";
                                const optionValue = isString
                                  ? opt
                                  : (opt.value ?? opt.label ?? "");
                                const optionId = isString
                                  ? oidx.toString()
                                  : (opt.id ?? oidx.toString());
                                const isCorrect =
                                  !isString &&
                                  typeof opt.isCorrect === "boolean"
                                    ? opt.isCorrect
                                    : typeof q.answer === "string"
                                      ? optionValue === q.answer
                                      : Number(optionValue) === q.answer;

                                return {
                                  id: optionId,
                                  text: optionValue.toString(),
                                  isCorrect,
                                };
                              }
                            )
                          : [];

                      return {
                        id: questionId,
                        type: questionType,
                        difficulty: questionDifficulty,
                        category: questionCategory,
                        question: q.question,
                        answer: q.answer,
                        points: q.points,
                        options: normalizedOptions,
                      };
                    }
                  ),
                }
              : undefined
          }
          onSave={async (template) => {
            const now = Date.now();
            const mcqTemplate: MCQTemplate = {
              _id: template._id as Id<"mcqTemplates">,
              title: template.title,
              description: template.description,
              category: template.category,
              difficulty: template.difficulty,
              timeLimit: template.timeLimit,
              passingScore: template.passingScore,
              questions: template.questions.map((q) => {
                const normalized = q as NormalizedMCQQuestion & {
                  correctAnswer?: string | number;
                };

                const answer: string | number =
                  typeof normalized.answer === "string" ||
                  typeof normalized.answer === "number"
                    ? normalized.answer
                    : typeof normalized.correctAnswer === "string" ||
                        typeof normalized.correctAnswer === "number"
                      ? normalized.correctAnswer
                      : "";

                return {
                  question: normalized.question,
                  options: normalized.options.map((opt) => opt.text),
                  answer,
                  points: normalized.points,
                };
              }),
              tags: template.tags,
              totalPoints: template.totalPoints,
              usageCount:
                (template as unknown as Partial<MCQTemplate>).usageCount ?? 0,
              createdAt:
                (template as unknown as Partial<MCQTemplate>).createdAt ?? now,
              updatedAt: now,
            };

            await handleSaveMCQTemplate(mcqTemplate);
          }}
        />

        <ScheduleAssignmentModal
          open={scheduleModalOpen}
          onOpenChange={setScheduleModalOpen}
          assignmentTitle={selectedTemplate?.title || ""}
          onSchedule={handleCreateMCQAssignment}
          isScheduling={isMCQCreating}
        />
      </div>
    </ProtectedRoute>
  );
}
