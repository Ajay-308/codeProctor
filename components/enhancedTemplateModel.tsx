"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import LeetCodeProblemSelector from "./leetcodeProblemSelector";

// Updated Template interface to match your main component
interface Template {
  _id?: string;
  title: string;
  description?: string;
  tags: string[];
  difficulty: "easy" | "medium" | "hard" | "expert";
  language: string;
  timeLimit: number;
  usageCount: number;
  updatedAt: string;
  // Enhanced fields
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  sampleInput?: string;
  sampleOutput?: string;
  explanation?: string;
}

interface LeetCodeProblem {
  id: string;
  title: string;
  url: string;
  difficulty: "Easy" | "Medium" | "Hard";
  isPremium: boolean;
  topics: string[];
  description: string;
  exampleTestCases: string;
  sampleTestCase: string;
  codeSnippets: Array<{
    lang: string;
    code: string;
  }>;
}

// Updated props interface to accept async onSave
interface EnhancedTemplateModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  template?: {
    _id: string;
    title: string;
    description: string;
    language: string;
    difficulty: "easy" | "medium" | "hard" | "expert";
    tags: string[];
    timeLimit: number;
  };
  onSave?: (template: Template) => Promise<void>; // Changed to async
}

export default function EnhancedTemplateModal({
  open,
  setOpen,
  template,
  onSave,
}: EnhancedTemplateModalProps) {
  const [formData, setFormData] = useState<Partial<Template>>({
    title: "",
    description: "",
    tags: [],
    difficulty: "easy",
    language: "",
    timeLimit: 30,
  });
  const [tagInput, setTagInput] = useState("");
  const [showLeetCodeSelector, setShowLeetCodeSelector] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData({
        _id: template._id,
        title: template.title,
        description: template.description,
        tags: template.tags,
        difficulty: template.difficulty,
        language: template.language,
        timeLimit: template.timeLimit,
      });
      setTagInput(template.tags.join(", "));
    } else {
      setFormData({
        title: "",
        description: "",
        tags: [],
        difficulty: "easy",
        language: "",
        timeLimit: 30,
      });
      setTagInput("");
    }
  }, [template, open]);

  const handleLeetCodeProblemSelect = (problem: LeetCodeProblem) => {
    // Map LeetCode problem to template format
    const mappedDifficulty = problem.difficulty.toLowerCase() as
      | "easy"
      | "medium"
      | "hard";
    const primaryLanguage = problem.codeSnippets[0]?.lang || "JavaScript";

    setFormData({
      ...formData,
      title: problem.title,
      description: problem.description,
      tags: problem.topics,
      difficulty: mappedDifficulty === "hard" ? "hard" : mappedDifficulty,
      language: primaryLanguage,
    });
    setTagInput(problem.topics.join(", "));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const tagsArray = tagInput
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      // Create complete template data with all required fields
      const templateData: Template = {
        _id: formData._id,
        title: formData.title || "",
        description: formData.description || "",
        tags: tagsArray,
        difficulty: formData.difficulty || "easy",
        language: formData.language || "",
        timeLimit: formData.timeLimit || 30,
        // Provide defaults for required fields that aren't in the form
        usageCount: 0, // Will be handled by backend for existing templates
        updatedAt: new Date().toISOString(),
        // Enhanced fields (empty for now, but could be added to form later)
        inputFormat: "",
        outputFormat: "",
        constraints: "",
        sampleInput: "",
        sampleOutput: "",
        explanation: "",
      };

      if (onSave) {
        await onSave(templateData);
        setOpen(false);
      }
    } catch (error) {
      console.error("Error saving template:", error);
      // You could add error handling here (toast notification, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagsChange = (value: string) => {
    setTagInput(value);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center justify-between">
              {template ? "Edit Template" : "New Template"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* LeetCode Problem Selector Button */}
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLeetCodeSelector(true)}
                className="w-full border-dashed border-2 border-violet-300 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950"
              >
                <Search className="mr-2 h-4 w-4" />
                Select from LeetCode Problems
              </Button>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Enter template title"
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter template description"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-sm font-medium">
                    Language <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.language || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, language: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JavaScript">JavaScript</SelectItem>
                      <SelectItem value="Python">Python</SelectItem>
                      <SelectItem value="Java">Java</SelectItem>
                      <SelectItem value="C++">C++</SelectItem>
                      <SelectItem value="C#">C#</SelectItem>
                      <SelectItem value="Go">Go</SelectItem>
                      <SelectItem value="Rust">Rust</SelectItem>
                      <SelectItem value="TypeScript">TypeScript</SelectItem>
                      <SelectItem value="MySQL">MySQL</SelectItem>
                      <SelectItem value="PostgreSQL">PostgreSQL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty" className="text-sm font-medium">
                    Difficulty <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.difficulty || "easy"}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        difficulty: value as
                          | "easy"
                          | "medium"
                          | "hard"
                          | "expert",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags" className="text-sm font-medium">
                  Tags
                </Label>
                <Input
                  id="tags"
                  placeholder="Enter tags separated by commas"
                  value={tagInput}
                  onChange={(e) => handleTagsChange(e.target.value)}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Example: arrays, sorting, recursion
                </p>
                {tagInput && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tagInput.split(",").map((tag, idx) => {
                      const trimmedTag = tag.trim();
                      return trimmedTag ? (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {trimmedTag}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeLimit" className="text-sm font-medium">
                  Time Limit (minutes) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="timeLimit"
                  type="number"
                  min="1"
                  max="180"
                  value={formData.timeLimit || 30}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      timeLimit: Number.parseInt(e.target.value) || 30,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-black hover:bg-gray-800 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : template ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <LeetCodeProblemSelector
        open={showLeetCodeSelector}
        onOpenChange={setShowLeetCodeSelector}
        onSelectProblem={handleLeetCodeProblemSelect}
      />
    </>
  );
}
