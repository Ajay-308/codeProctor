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

// Updated Template interface to match your schema and LeetCode data
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
  createdAt: string;
  // Enhanced fields from your schema
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
  inputFormat?: string;
  outputFormat?: string;
  sampleInput?: string;
  sampleOutput?: string;
  codeSnippets: Array<{
    lang: string;
    code: string;
  }>;
}

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
    inputFormat?: string;
    outputFormat?: string;
    constraints?: string;
    sampleInput?: string;
    sampleOutput?: string;
    explanation?: string;
  };
  onSave?: (template: Template) => Promise<void>;
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
    inputFormat: "",
    outputFormat: "",
    constraints: "",
    sampleInput: "",
    sampleOutput: "",
    explanation: "",
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
        inputFormat: template.inputFormat || "",
        outputFormat: template.outputFormat || "",
        constraints: template.constraints || "",
        sampleInput: template.sampleInput || "",
        sampleOutput: template.sampleOutput || "",
        explanation: template.explanation || "",
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
        inputFormat: "",
        outputFormat: "",
        constraints: "",
        sampleInput: "",
        sampleOutput: "",
        explanation: "",
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

    // Extract constraints from description if available
    const extractConstraints = (description: string) => {
      const constraintsMatch = description.match(
        /Constraints:?\s*([\s\S]*?)(?=\n\n|\n[A-Z]|$)/i
      );
      return constraintsMatch ? constraintsMatch[1].trim() : "";
    };

    setFormData({
      ...formData,
      title: problem.title,
      description: problem.description,
      tags: problem.topics,
      difficulty: mappedDifficulty === "hard" ? "hard" : mappedDifficulty,
      language: primaryLanguage,
      inputFormat: problem.inputFormat || "",
      outputFormat: problem.outputFormat || "",
      constraints: extractConstraints(problem.description),
      sampleInput: problem.sampleInput || "",
      sampleOutput: problem.sampleOutput || "",
    });
    setTagInput(problem.topics.join(", "));
    setShowLeetCodeSelector(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const tagsArray = tagInput
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const templateData: Template = {
        _id: formData._id,
        title: formData.title || "",
        description: formData.description || "",
        tags: tagsArray,
        difficulty: formData.difficulty || "easy",
        language: formData.language || "",
        timeLimit: formData.timeLimit || 30,
        usageCount: 0,
        updatedAt: new Date().toISOString(),
        createdAt: formData._id ? "" : new Date().toISOString(), // Will be set by backend for new templates
        inputFormat: formData.inputFormat || "",
        outputFormat: formData.outputFormat || "",
        constraints: formData.constraints || "",
        sampleInput: formData.sampleInput || "",
        sampleOutput: formData.sampleOutput || "",
        explanation: formData.explanation || "",
      };

      if (onSave) {
        await onSave(templateData);
        setOpen(false);
      }
    } catch (error) {
      console.error("Error saving template:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagsChange = (value: string) => {
    setTagInput(value);
  };

  const handleInputChange = (field: keyof Template, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center justify-between">
              {template ? "Edit Template" : "New Template"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* LeetCode Problem Selector Button */}
            {!template && (
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50/50 dark:bg-blue-950/20">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowLeetCodeSelector(true)}
                  className="w-full border-dashed border-2 border-blue-400 hover:border-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Select from LeetCode Problems →
                </Button>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Browse 2000+ LeetCode problems to auto-populate your template
                </p>
              </div>
            )}

            {/* Basic Information */}
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter template title"
                    value={formData.title || ""}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
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
                      handleInputChange(
                        "timeLimit",
                        parseInt(e.target.value) || 30
                      )
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-sm font-medium">
                    Language <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.language || ""}
                    onValueChange={(value) =>
                      handleInputChange("language", value)
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Python">Python</SelectItem>
                      <SelectItem value="JavaScript">JavaScript</SelectItem>
                      <SelectItem value="TypeScript">TypeScript</SelectItem>
                      <SelectItem value="Java">Java</SelectItem>
                      <SelectItem value="C++">C++</SelectItem>
                      <SelectItem value="C#">C#</SelectItem>
                      <SelectItem value="Go">Go</SelectItem>
                      <SelectItem value="Rust">Rust</SelectItem>
                      <SelectItem value="Swift">Swift</SelectItem>
                      <SelectItem value="Kotlin">Kotlin</SelectItem>
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
                      handleInputChange("difficulty", value)
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
                  placeholder="Two Pointers, String"
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
                <Label htmlFor="description" className="text-sm font-medium">
                  Problem Statement
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter the problem statement"
                  value={formData.description || ""}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={6}
                  className="resize-none"
                />
              </div>

              {/* Input/Output Format Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inputFormat" className="text-sm font-medium">
                    Input Format
                  </Label>
                  <Textarea
                    id="inputFormat"
                    placeholder='s = ["h","e","l","l","o"]'
                    value={formData.inputFormat || ""}
                    onChange={(e) =>
                      handleInputChange("inputFormat", e.target.value)
                    }
                    rows={3}
                    className="resize-none font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="outputFormat" className="text-sm font-medium">
                    Output Format
                  </Label>
                  <Textarea
                    id="outputFormat"
                    placeholder='["o","l","l","e","h"]'
                    value={formData.outputFormat || ""}
                    onChange={(e) =>
                      handleInputChange("outputFormat", e.target.value)
                    }
                    rows={3}
                    className="resize-none font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="constraints" className="text-sm font-medium">
                  Constraints
                </Label>
                <Textarea
                  id="constraints"
                  placeholder="1 <= s.length <= 10^5"
                  value={formData.constraints || ""}
                  onChange={(e) =>
                    handleInputChange("constraints", e.target.value)
                  }
                  rows={3}
                  className="resize-none font-mono text-sm"
                />
              </div>

              {/* Sample Input/Output Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sampleInput" className="text-sm font-medium">
                    Sample Input
                  </Label>
                  <Textarea
                    id="sampleInput"
                    placeholder='s = ["h","e","l","l","o"]'
                    value={formData.sampleInput || ""}
                    onChange={(e) =>
                      handleInputChange("sampleInput", e.target.value)
                    }
                    rows={3}
                    className="resize-none font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sampleOutput" className="text-sm font-medium">
                    Sample Output
                  </Label>
                  <Textarea
                    id="sampleOutput"
                    placeholder='["o","l","l","e","h"]'
                    value={formData.sampleOutput || ""}
                    onChange={(e) =>
                      handleInputChange("sampleOutput", e.target.value)
                    }
                    rows={3}
                    className="resize-none font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="explanation" className="text-sm font-medium">
                  Explanation
                </Label>
                <Textarea
                  id="explanation"
                  placeholder="Reverse the array in-place with O(1) extra memory."
                  value={formData.explanation || ""}
                  onChange={(e) =>
                    handleInputChange("explanation", e.target.value)
                  }
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
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
                className="bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
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
