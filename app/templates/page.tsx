"use client";

import React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Code,
  FileCode,
  Database,
  Filter,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { Id } from "@/convex/_generated/dataModel";

// Components
import MCQTemplateModal from "@/components/mcq-template-model";
import EnhancedTemplateModal from "@/components/enhancedTemplateModel";
import ScheduleAssignmentModal from "@/components/schedule-assignment-model";
import ConfirmDelete from "@/components/ConfirmDelete";
import ProtectedRoute from "@/components/protectedComponent";
import Navbar from "@/components/Navbar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Hooks
import { useMCQTemplates } from "@/hooks/useMcqTemplate";
import { useTemplateAssignment } from "@/hooks/useAssisment";
import { MCQTemplate } from "@/types/mcq";

// Types
import type { ScheduleData } from "@/components/schedule-assignment-model";

interface CodingTemplate {
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
interface NormalizedMCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

type NormalizedMCQQuestion = {
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

export default function UnifiedTemplatesPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  // State
  const [activeTab, setActiveTab] = useState("coding");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "language" | "difficulty">(
    "all"
  );

  // Coding Templates State
  const [isCodingModalOpen, setIsCodingModalOpen] = useState(false);
  const [editCodingTemplate, setEditCodingTemplate] =
    useState<CodingTemplate | null>(null);
  const [previewCodingTemplate, setPreviewCodingTemplate] =
    useState<CodingTemplate | null>(null);
  const [codingDeleteId, setCodingDeleteId] = useState<Id<"templetes"> | null>(
    null
  );
  const [codingTemplateToDelete, setCodingTemplateToDelete] = useState<
    string | undefined
  >(undefined);

  // MCQ Templates State
  const [isMCQModalOpen, setIsMCQModalOpen] = useState(false);
  const [editMCQTemplate, setEditMCQTemplate] = useState<MCQTemplate | null>(
    null
  );
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MCQTemplate | null>(
    null
  );

  // Coding Templates Hooks
  const codingTemplates = useQuery(api.templets.getTempletes);
  const deleteCodingTemplate = useMutation(api.templets.deleteTempletes);
  const duplicateCodingTemplate = useMutation(api.templets.duplicateTemmpletes);
  const createCodingTemplate = useMutation(api.templets.addTempletes);
  const updateCodingTemplate = useMutation(api.templets.updateTempletes);
  const { createAssignmentFromTemplate, isCreating: isCodingCreating } =
    useTemplateAssignment();

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

  // Coding Template Handlers
  const openCodingModal = (template: CodingTemplate | null) => {
    setEditCodingTemplate(template);
    setIsCodingModalOpen(true);
  };

  const handleSaveCodingTemplate = async (templateData: CodingTemplate) => {
    try {
      if (editCodingTemplate && editCodingTemplate._id) {
        await updateCodingTemplate({
          id: editCodingTemplate._id as Id<"templetes">,
          updates: { ...templateData },
        });
        toast.success(`Template "${templateData.title}" updated successfully!`);
      } else {
        await createCodingTemplate({
          ...templateData,
          description: templateData.description ?? "",
        });
        toast.success(`Template "${templateData.title}" created successfully!`);
      }
      setIsCodingModalOpen(false);
      setEditCodingTemplate(null);
    } catch (error) {
      toast.error(
        `Failed to ${editCodingTemplate ? "update" : "create"} template "${templateData.title}"`
      );
      console.error("Failed to save template", error);
    }
  };

  const handleDuplicateCoding = (template: {
    _id: Id<"templetes">;
    title: string;
  }) => {
    duplicateCodingTemplate({ id: template._id })
      .then(() => {
        toast.success(`Template "${template.title}" duplicated successfully!`);
      })
      .catch((error) => {
        toast.error(`Failed to duplicate template "${template.title}"`);
        console.error("Failed to duplicate template", error);
      });
  };

  const handleDeleteCoding = (template: CodingTemplate) => {
    setCodingDeleteId((template._id as Id<"templetes">) || null);
    setCodingTemplateToDelete(template.title);
  };

  const confirmCodingDelete = async () => {
    if (codingDeleteId) {
      try {
        await deleteCodingTemplate({ id: codingDeleteId });
        toast.success(
          `Template "${codingTemplateToDelete}" deleted successfully!`
        );
      } catch (error) {
        toast.error(`Failed to delete template "${codingTemplateToDelete}"`);
        console.error("Failed to delete template", error);
      }
      setCodingDeleteId(null);
      setCodingTemplateToDelete(undefined);
    }
  };

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
      setIsMCQModalOpen(false);
      setEditMCQTemplate(null);
    } catch (error) {
      // Error handling is done in the hook
      console.error("failed to save mcq template", error);
    }
  };

  const handleDuplicateMCQ = async (template: MCQTemplate) => {
    try {
      await duplicateMCQTemplate(template._id, template.title);
    } catch (error) {
      // Error handling is done in the hook
      console.error("failed to duplicate mcq template", error);
    }
  };

  const handleDeleteMCQ = async (template: MCQTemplate) => {
    if (
      window.confirm(`Are you sure you want to delete "${template.title}"?`)
    ) {
      try {
        await deleteMCQTemplate(template._id, template.title);
      } catch (error) {
        // Error handling is done in the hook
        console.error("failed to delete mcq template", error);
      }
    }
  };

  const handleScheduleAssignment = (template: MCQTemplate) => {
    setSelectedTemplate(template);
    setScheduleModalOpen(true);
  };

  // Define the expected type for scheduleData

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
      // Error handling is done in the hook
      console.error("failed to save mcq assignment", error);
    }
  };

  // Utility functions
  const getLanguageGradient = (language: string) => {
    const hash = language
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue1 = hash % 360;
    const hue2 = (hue1 + 40) % 360;
    return `linear-gradient(135deg, hsl(${hue1}, 80%, 60%), hsl(${hue2}, 80%, 50%))`;
  };

  // Filter templates
  const filteredCodingTemplates = codingTemplates?.filter(
    (template) =>
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (template.description ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      template.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // Removed redundant FilteredMCQTemplate interface

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
            // Spread any other properties if needed
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
              Templates
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage coding challenges and MCQ assessments
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Database className="h-4 w-4" />
                <span>2817 LeetCode problems available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="coding" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Coding Templates
              </TabsTrigger>
              <TabsTrigger value="mcq" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                MCQ Templates
              </TabsTrigger>
            </TabsList>

            <Button
              variant="default"
              size="sm"
              onClick={() =>
                activeTab === "coding"
                  ? openCodingModal(null)
                  : openMCQModal(null)
              }
              className="bg-black hover:bg-gray-800 cursor-pointer text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              New {activeTab === "coding" ? "Coding" : "MCQ"} Template
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                className="w-full pl-10 border-slate-200 dark:border-slate-700 rounded-lg focus-visible:ring-violet-500"
                placeholder={`Search ${activeTab} templates...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {activeTab === "coding" && (
              <div className="flex items-center gap-2 ml-auto">
                <div className="flex items-center mr-2">
                  <Filter className="h-4 w-4 mr-2 text-slate-400" />
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Filter:
                  </span>
                </div>
                {["all", "language", "difficulty"].map((type) => (
                  <Button
                    key={type}
                    variant={filter === type ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setFilter(type as "all" | "language" | "difficulty")
                    }
                    className={cn(
                      "rounded-full text-xs font-medium",
                      filter === type
                        ? "bg-violet-600 hover:bg-violet-700 text-white"
                        : "text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    )}
                  >
                    {type === "all"
                      ? "All"
                      : `${type.charAt(0).toUpperCase() + type.slice(1)}`}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Coding Templates Tab */}
          <TabsContent value="coding" className="space-y-6">
            {(filteredCodingTemplates?.length ?? 0) === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <FileCode className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                  {codingTemplates?.length === 0
                    ? "No coding templates yet"
                    : "No templates found"}
                </h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md">
                  {codingTemplates?.length === 0
                    ? "Create your first coding template by selecting from 2817 LeetCode problems or start from scratch."
                    : "We couldn't find any templates matching your search criteria."}
                </p>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => openCodingModal(null)}
                  className="mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  {codingTemplates?.length === 0
                    ? "Create First Template"
                    : "New Template"}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredCodingTemplates?.map((template) => (
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
                              onClick={() => handleDuplicateCoding(template)}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              <span>Duplicate</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openCodingModal(template)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteCoding(template)}
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
                          <div
                            className="px-3 py-1 text-xs font-medium text-white rounded-full"
                            style={{
                              background: getLanguageGradient(
                                template.language
                              ),
                            }}
                          >
                            {template.language}
                          </div>
                          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            {template.timeLimit} min
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {template.tags.slice(0, 3).map((tag, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs font-normal px-2 py-0.5 bg-slate-50 dark:bg-slate-900"
                            >
                              <Hash className="h-3 w-3 mr-1 text-slate-400" />
                              {tag}
                            </Badge>
                          ))}
                          {template.tags.length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-xs font-normal px-2 py-0.5 bg-slate-50 dark:bg-slate-900"
                            >
                              +{template.tags.length - 3} more
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
                              {new Date(
                                template.updatedAt
                              ).toLocaleDateString()}
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
                        onClick={() => setPreviewCodingTemplate(template)}
                      >
                        Preview
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="text-xs h-7 cursor-pointer px-2 bg-black hover:bg-gray-800 border-0"
                        onClick={() =>
                          createAssignmentFromTemplate({
                            ...template,
                            description: template.description ?? "",
                            testCases:
                              ((template as { testCases?: unknown[] })
                                .testCases as {
                                input: string;
                                output: string;
                              }[]) ?? [],
                          })
                        }
                        disabled={isCodingCreating}
                      >
                        {isCodingCreating ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1" />
                        ) : (
                          <Code className="mr-1 h-3 w-3" />
                        )}
                        {isCodingCreating ? "Creating..." : "Use Template"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* MCQ Templates Tab */}
          <TabsContent value="mcq" className="space-y-6">
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
                              {new Date(
                                template.updatedAt
                              ).toLocaleDateString()}
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
          </TabsContent>
        </Tabs>

        {/* Coding Template Preview Modal */}
        <Dialog
          open={!!previewCodingTemplate}
          onOpenChange={() => setPreviewCodingTemplate(null)}
        >
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="relative">
              <DialogTitle className="text-2xl font-bold">
                Template Preview
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 cursor-pointer"
                onClick={() => setPreviewCodingTemplate(null)}
              >
                <X className="h-4 w-4 cursor-pointer" />
              </Button>
            </DialogHeader>

            {previewCodingTemplate && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={getBadgeVariant(previewCodingTemplate.difficulty)}
                    className="font-medium text-xs px-2.5 py-0.5 rounded-full"
                  >
                    {previewCodingTemplate.difficulty.charAt(0).toUpperCase() +
                      previewCodingTemplate.difficulty.slice(1)}
                  </Badge>
                  <div
                    className="px-3 py-1 text-xs font-medium text-white rounded-full"
                    style={{
                      background: getLanguageGradient(
                        previewCodingTemplate.language
                      ),
                    }}
                  >
                    {previewCodingTemplate.language}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {previewCodingTemplate.title}
                  </h2>
                  {previewCodingTemplate.description && (
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                      <h3 className="text-sm font-medium mb-2">
                        Problem Statement
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                        {previewCodingTemplate.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Input/Output Format */}
                {(previewCodingTemplate.inputFormat ||
                  previewCodingTemplate.outputFormat) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {previewCodingTemplate.inputFormat && (
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <h3 className="text-sm font-medium mb-2">
                          Input Format
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap">
                          {previewCodingTemplate.inputFormat}
                        </p>
                      </div>
                    )}
                    {previewCodingTemplate.outputFormat && (
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <h3 className="text-sm font-medium mb-2">
                          Output Format
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap">
                          {previewCodingTemplate.outputFormat}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Constraints */}
                {previewCodingTemplate.constraints && (
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">Constraints</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap">
                      {previewCodingTemplate.constraints}
                    </p>
                  </div>
                )}

                {/* Sample Input/Output */}
                {(previewCodingTemplate.sampleInput ||
                  previewCodingTemplate.sampleOutput) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {previewCodingTemplate.sampleInput && (
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <h3 className="text-sm font-medium mb-2">
                          Sample Input
                        </h3>
                        <pre className="text-slate-600 dark:text-slate-300 text-sm bg-white dark:bg-slate-900 p-3 rounded border overflow-x-auto">
                          {previewCodingTemplate.sampleInput}
                        </pre>
                      </div>
                    )}
                    {previewCodingTemplate.sampleOutput && (
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <h3 className="text-sm font-medium mb-2">
                          Sample Output
                        </h3>
                        <pre className="text-slate-600 dark:text-slate-300 text-sm bg-white dark:bg-slate-900 p-3 rounded border overflow-x-auto">
                          {previewCodingTemplate.sampleOutput}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Explanation */}
                {previewCodingTemplate.explanation && (
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">Explanation</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap">
                      {previewCodingTemplate.explanation}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                      <Clock className="h-4 w-4 mr-2" />
                      Time Limit: {previewCodingTemplate.timeLimit} min
                    </div>
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                      <BarChart2 className="h-4 w-4 mr-2" />
                      Used {previewCodingTemplate.usageCount} times
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Tags:</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {previewCodingTemplate.tags.map((tag, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="text-xs font-normal px-2 py-0.5 bg-slate-50 dark:bg-slate-900"
                        >
                          <Hash className="h-3 w-3 mr-1 text-slate-400" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1.5" />
                    <span>
                      Last Updated:{" "}
                      {new Date(
                        previewCodingTemplate.updatedAt
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Coding Template Delete Confirmation Modal */}
        <Dialog
          open={!!codingDeleteId}
          onOpenChange={() => setCodingDeleteId(null)}
        >
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Delete Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Are you sure you want to delete &quot;{codingTemplateToDelete}
                &quot;? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCodingDeleteId(null)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmCodingDelete}>
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Enhanced Coding Template Modal */}
        <EnhancedTemplateModal
          open={isCodingModalOpen}
          setOpen={setIsCodingModalOpen}
          template={
            editCodingTemplate && editCodingTemplate._id
              ? {
                  _id: editCodingTemplate._id,
                  title: editCodingTemplate.title,
                  description: editCodingTemplate.description || "",
                  language: editCodingTemplate.language,
                  difficulty: editCodingTemplate.difficulty,
                  tags: editCodingTemplate.tags,
                  timeLimit: editCodingTemplate.timeLimit,
                }
              : undefined
          }
          onSave={handleSaveCodingTemplate}
        />

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
                      // Ensure type is "single" or "multiple"
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
              _id: template._id as Id<"mcqTemplates">, // only if it exists
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

        {/* Schedule Assignment Modal */}
        <ScheduleAssignmentModal
          open={scheduleModalOpen}
          onOpenChange={setScheduleModalOpen}
          assignmentTitle={selectedTemplate?.title || ""}
          onSchedule={handleCreateMCQAssignment}
          isScheduling={isMCQCreating}
        />

        <ConfirmDelete
          id={codingDeleteId}
          setId={setCodingDeleteId}
          deleteFn={async (payload) => {
            await deleteCodingTemplate(payload);
          }}
          templateName={codingTemplateToDelete}
        />
      </div>
    </ProtectedRoute>
  );
}
