"use client";

import type React from "react";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Code,
  FileCode,
  Plus,
  MoreVertical,
  Copy,
  Pencil,
  Trash2,
  Search,
  Filter,
  Clock,
  Hash,
  Calendar,
  BarChart2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TemplateModal from "@/components/TempleteModel";
import ConfirmDelete from "@/components/ConfirmDelete";
import type { Id } from "@/convex/_generated/dataModel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import toast from "react-hot-toast";

// Map the variants to actual UI variants that our Badge component supports
const getBadgeVariant = (difficulty: "easy" | "medium" | "hard" | "expert") => {
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

const getDifficultyColor = (
  difficulty: "easy" | "medium" | "hard" | "expert"
) => {
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

type Template = {
  _id: Id<"templetes">;
  title: string;
  description?: string;
  tags: string[];
  difficulty: "easy" | "medium" | "hard" | "expert";
  language: string;
  timeLimit: number;
  usageCount: number;
  updatedAt: string;
};

const TemplatesList: React.FC = () => {
  const templates = useQuery(api.templets.getTempletes);
  const deleteTemplate = useMutation(api.templets.deleteTempletes);
  const DuplicateTemplate = useMutation(api.templets.duplicateTemmpletes);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "language" | "difficulty">(
    "all"
  );
  const [, setIsMenuOpen] = useState<string | null>(null);
  const [editTemplate, setEditTemplate] = useState<Template | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<Id<"templetes"> | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<string | undefined>(
    undefined
  );
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const openModal = (template: Template | null) => {
    setEditTemplate(template);
    setIsModalOpen(true);
  };

  const handleDuplicate = (template: {
    _id: Id<"templetes">;
    title: string;
  }) => {
    DuplicateTemplate({ id: template._id })
      .then(() => {
        toast.success(`Template "${template.title}" duplicated successfully!`);
      })
      .catch((error) => {
        toast.error(`failed to duplicate template "${template.title}"`);
        console.error("failed to duplicate template", error);
      });
  };

  const handleDelete = (template: { _id: Id<"templetes">; title: string }) => {
    setDeleteId(template._id);
    setTemplateToDelete(template.title);
    setIsMenuOpen(null); // Close the menu when opening delete dialog
  };

  const filteredTemplates = templates?.filter(
    (template) =>
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (template.description ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      template.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const getLanguageGradient = (language: string) => {
    const hash = language
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue1 = hash % 360;
    const hue2 = (hue1 + 40) % 360;
    return `linear-gradient(135deg, hsl(${hue1}, 80%, 60%), hsl(${hue2}, 80%, 50%))`;
  };

  return (
    <>
      <Navbar />

      <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 min-h-screen">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-black bg-clip-text text-transparent">
              Templates
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage and customize coding challenge templates
            </p>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={() => openModal(null)}
            className="bg-black hover:from-violet-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            New Template
          </Button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              className="w-full pl-10 border-slate-200 dark:border-slate-700 rounded-lg focus-visible:ring-violet-500"
              placeholder="Search templates..."
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
        </div>

        {filteredTemplates?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <FileCode className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
              No templates found
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md">
              We couldn&apos;t find any templates matching your search criteria.
              Try adjusting your search or create a new template.
            </p>
            <Button
              variant="default"
              size="sm"
              onClick={() => openModal(null)}
              className="mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              New Template
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTemplates?.map((template) => (
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
                          onClick={() => {
                            handleDuplicate(template);
                          }}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          <span>Duplicate</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openModal(template)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(template)}
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
                          background: getLanguageGradient(template.language),
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
                    className="text-xs h-7 px-2"
                    onClick={() => setPreviewTemplate(template)}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="text-xs h-7 px-2 bg-black hover:bg-gray-800 border-0"
                  >
                    <Code className="mr-1 h-3 w-3" />
                    Use Template
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Preview Modal */}
        <Dialog
          open={!!previewTemplate}
          onOpenChange={() => setPreviewTemplate(null)}
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader className="relative">
              <DialogTitle className="text-2xl font-bold">
                Template Preview
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={() => setPreviewTemplate(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>

            {previewTemplate && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={getBadgeVariant(previewTemplate.difficulty)}
                    className="font-medium text-xs px-2.5 py-0.5 rounded-full"
                  >
                    {previewTemplate.difficulty.charAt(0).toUpperCase() +
                      previewTemplate.difficulty.slice(1)}
                  </Badge>
                  <div
                    className="px-3 py-1 text-xs font-medium text-white rounded-full"
                    style={{
                      background: getLanguageGradient(previewTemplate.language),
                    }}
                  >
                    {previewTemplate.language}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {previewTemplate.title}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300">
                    {previewTemplate.description || "No description provided"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                      <Clock className="h-4 w-4 mr-2" />
                      Time Limit: {previewTemplate.timeLimit} min
                    </div>
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                      <BarChart2 className="h-4 w-4 mr-2" />
                      Used {previewTemplate.usageCount} times
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Tags:</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {previewTemplate.tags.map((tag, idx) => (
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
                      {new Date(previewTemplate.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <TemplateModal
          open={isModalOpen}
          setOpen={setIsModalOpen}
          template={
            editTemplate
              ? { ...editTemplate, description: editTemplate.description || "" }
              : undefined
          }
        />
        <ConfirmDelete
          id={deleteId}
          setId={setDeleteId}
          deleteFn={deleteTemplate}
          templateName={templateToDelete}
        />
      </div>
    </>
  );
};

export default TemplatesList;
