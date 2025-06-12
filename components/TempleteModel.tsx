"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import React, { useEffect, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "expert", label: "Expert" },
];

const LANGUAGE_OPTIONS = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "C#",
  "PHP",
  "Ruby",
  "Go",
  "Rust",
  "Swift",
];

export default function TemplateModal({
  open,
  setOpen,
  template,
}: {
  open: boolean;
  setOpen: (val: boolean) => void;
  template?: {
    _id: string;
    title: string;
    description?: string;
    language: string;
    difficulty: string;
    tags: string[];
    timeLimit: number;
    inputFormat?: string;
    outputFormat?: string;
    constraints?: string;
    sampleInput?: string;
    sampleOutput?: string;
    explanation?: string;
  };
}) {
  const createTemplate = useMutation(api.templets.addTempletes);
  const updateTemplate = useMutation(api.templets.updateTempletes);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    language: "",
    difficulty: "easy",
    tags: "",
    timeLimit: 30,
    inputFormat: "",
    outputFormat: "",
    constraints: "",
    sampleInput: "",
    sampleOutput: "",
    explanation: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (template) {
      setFormData({
        title: template.title,
        description: template.description || "",
        language: template.language,
        difficulty: template.difficulty,
        tags: template.tags.join(", "),
        timeLimit: template.timeLimit,
        inputFormat: template.inputFormat || "",
        outputFormat: template.outputFormat || "",
        constraints: template.constraints || "",
        sampleInput: template.sampleInput || "",
        sampleOutput: template.sampleOutput || "",
        explanation: template.explanation || "",
      });
    } else {
      // Reset to default values when creating a new template
      setFormData({
        title: "",
        description: "",
        language: "",
        difficulty: "easy",
        tags: "",
        timeLimit: 30,
        inputFormat: "",
        outputFormat: "",
        constraints: "",
        sampleInput: "",
        sampleOutput: "",
        explanation: "",
      });
    }
    setErrors({});
  }, [template, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.language) {
      newErrors.language = "Language is required";
    }

    if (!formData.difficulty) {
      newErrors.difficulty = "Difficulty is required";
    }

    if (formData.timeLimit <= 0) {
      newErrors.timeLimit = "Time limit must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        language: formData.language,
        difficulty: formData.difficulty as
          | "easy"
          | "medium"
          | "hard"
          | "expert",
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        timeLimit: Number(formData.timeLimit),
        inputFormat: formData.inputFormat || undefined,
        outputFormat: formData.outputFormat || undefined,
        constraints: formData.constraints || undefined,
        sampleInput: formData.sampleInput || undefined,
        sampleOutput: formData.sampleOutput || undefined,
        explanation: formData.explanation || undefined,
      };

      if (template) {
        await updateTemplate({
          id: template._id as Id<"templetes">,
          updates: payload,
        });
      } else {
        await createTemplate(payload);
      }

      setOpen(false);
    } catch (error) {
      console.error("Error saving template:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!isSubmitting) setOpen(value);
      }}
    >
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? "Edit Template" : "New Template"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter template title"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="timeLimit" className="text-sm font-medium">
                Time Limit (minutes) <span className="text-red-500">*</span>
              </label>
              <Input
                id="timeLimit"
                name="timeLimit"
                type="number"
                value={formData.timeLimit}
                onChange={handleChange}
                min={1}
                className={errors.timeLimit ? "border-red-500" : ""}
              />
              {errors.timeLimit && (
                <p className="text-xs text-red-500">{errors.timeLimit}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="language" className="text-sm font-medium">
                Language <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.language}
                onValueChange={(value) => handleSelectChange("language", value)}
              >
                <SelectTrigger
                  className={errors.language ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.language && (
                <p className="text-xs text-red-500">{errors.language}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="difficulty" className="text-sm font-medium">
                Difficulty <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) =>
                  handleSelectChange("difficulty", value)
                }
              >
                <SelectTrigger
                  className={errors.difficulty ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select difficulty level" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.difficulty && (
                <p className="text-xs text-red-500">{errors.difficulty}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="tags" className="text-sm font-medium">
              Tags
            </label>
            <Input
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="Enter tags separated by commas"
            />
            <p className="text-xs text-gray-500">
              Example: arrays, sorting, recursion
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Problem Statement
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter the problem statement"
              rows={4}
            />
          </div>

          {/* LeetCode-style fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="inputFormat" className="text-sm font-medium">
                Input Format
              </label>
              <Textarea
                id="inputFormat"
                name="inputFormat"
                value={formData.inputFormat}
                onChange={handleChange}
                placeholder="Describe the input format"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="outputFormat" className="text-sm font-medium">
                Output Format
              </label>
              <Textarea
                id="outputFormat"
                name="outputFormat"
                value={formData.outputFormat}
                onChange={handleChange}
                placeholder="Describe the expected output format"
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="constraints" className="text-sm font-medium">
              Constraints
            </label>
            <Textarea
              id="constraints"
              name="constraints"
              value={formData.constraints}
              onChange={handleChange}
              placeholder="Enter problem constraints (e.g., 1 <= n <= 10^5)"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="sampleInput" className="text-sm font-medium">
                Sample Input
              </label>
              <Textarea
                id="sampleInput"
                name="sampleInput"
                value={formData.sampleInput}
                onChange={handleChange}
                placeholder="Enter sample input"
                rows={4}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="sampleOutput" className="text-sm font-medium">
                Sample Output
              </label>
              <Textarea
                id="sampleOutput"
                name="sampleOutput"
                value={formData.sampleOutput}
                onChange={handleChange}
                placeholder="Enter expected output for sample input"
                rows={4}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="explanation" className="text-sm font-medium">
              Explanation
            </label>
            <Textarea
              id="explanation"
              name="explanation"
              value={formData.explanation}
              onChange={handleChange}
              placeholder="Explain the solution approach or provide hints"
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : template ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
