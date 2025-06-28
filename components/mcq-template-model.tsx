"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, X, HelpCircle, CheckCircle } from "lucide-react";
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

interface MCQTemplate {
  _id?: string;
  title: string;
  description: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number;
  passingScore: number;
  questions: MCQQuestion[];
  tags: string[];
  totalPoints: number;
}

interface MCQTemplateModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  template?: MCQTemplate;
  onSave: (template: MCQTemplate) => Promise<void>;
}

const categories = [
  "JavaScript",
  "React",
  "Node.js",
  "Python",
  "Java",
  "Database",
  "System Design",
  "Data Structures",
  "Algorithms",
  "General Programming",
  "Web Development",
  "DevOps",
];

const difficulties = [
  { value: "easy", label: "Easy", color: "bg-green-500" },
  { value: "medium", label: "Medium", color: "bg-yellow-500" },
  { value: "hard", label: "Hard", color: "bg-red-500" },
];

export default function MCQTemplateModal({
  open,
  setOpen,
  template,
  onSave,
}: MCQTemplateModalProps) {
  const [formData, setFormData] = useState<MCQTemplate>({
    title: "",
    description: "",
    category: "",
    difficulty: "easy",
    timeLimit: 30,
    passingScore: 70,
    questions: [],
    tags: [],
    totalPoints: 0,
  });

  const [currentQuestion, setCurrentQuestion] = useState<MCQQuestion>({
    id: "",
    question: "",
    options: [
      { id: "1", text: "", isCorrect: false },
      { id: "2", text: "", isCorrect: false },
      { id: "3", text: "", isCorrect: false },
      { id: "4", text: "", isCorrect: false },
    ],
    type: "single",
    points: 10,
    explanation: "",
    difficulty: "easy",
    category: "",
  });

  const [editingQuestionIndex, setEditingQuestionIndex] = useState<
    number | null
  >(null);
  const [showQuestionBuilder, setShowQuestionBuilder] = useState(false);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (template) {
      setFormData(template);
    } else {
      setFormData({
        title: "",
        description: "",
        category: "",
        difficulty: "easy",
        timeLimit: 30,
        passingScore: 70,
        questions: [],
        tags: [],
        totalPoints: 0,
      });
    }
  }, [template]);

  useEffect(() => {
    const totalPoints = formData.questions.reduce(
      (sum, q) => sum + q.points,
      0
    );
    setFormData((prev) => ({ ...prev, totalPoints }));
  }, [formData.questions]);

  const handleAddQuestion = () => {
    setCurrentQuestion({
      id: Date.now().toString(),
      question: "",
      options: [
        { id: "1", text: "", isCorrect: false },
        { id: "2", text: "", isCorrect: false },
        { id: "3", text: "", isCorrect: false },
        { id: "4", text: "", isCorrect: false },
      ],
      type: "single",
      points: 10,
      explanation: "",
      difficulty: "easy",
      category: formData.category,
    });
    setEditingQuestionIndex(null);
    setShowQuestionBuilder(true);
  };

  const handleEditQuestion = (index: number) => {
    setCurrentQuestion(formData.questions[index]);
    setEditingQuestionIndex(index);
    setShowQuestionBuilder(true);
  };

  const handleSaveQuestion = () => {
    if (!currentQuestion.question.trim()) return;

    const hasCorrectAnswer = currentQuestion.options.some(
      (opt) => opt.isCorrect
    );
    if (!hasCorrectAnswer) return;

    const updatedQuestions = [...formData.questions];

    if (editingQuestionIndex !== null) {
      updatedQuestions[editingQuestionIndex] = currentQuestion;
    } else {
      updatedQuestions.push(currentQuestion);
    }

    setFormData((prev) => ({ ...prev, questions: updatedQuestions }));
    setShowQuestionBuilder(false);
    setEditingQuestionIndex(null);
  };

  const handleDeleteQuestion = (index: number) => {
    const updatedQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, questions: updatedQuestions }));
  };

  const handleOptionChange = (optionId: string, text: string) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: prev.options.map((opt) =>
        opt.id === optionId ? { ...opt, text } : opt
      ),
    }));
  };

  const handleCorrectAnswerChange = (optionId: string, isCorrect: boolean) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: prev.options.map((opt) => {
        if (prev.type === "single") {
          return opt.id === optionId
            ? { ...opt, isCorrect }
            : { ...opt, isCorrect: false };
        } else {
          return opt.id === optionId ? { ...opt, isCorrect } : opt;
        }
      }),
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || formData.questions.length === 0) return;

    await onSave(formData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? "Edit MCQ Template" : "Create MCQ Template"}
          </DialogTitle>
        </DialogHeader>

        {!showQuestionBuilder ? (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Template Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g., JavaScript Fundamentals Quiz"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe what this assessment covers..."
                rows={3}
              />
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value: "easy" | "medium" | "hard") =>
                    setFormData((prev) => ({ ...prev, difficulty: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((diff) => (
                      <SelectItem key={diff.value} value={diff.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className={cn("w-2 h-2 rounded-full", diff.color)}
                          />
                          {diff.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  value={formData.timeLimit}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      timeLimit: Number.parseInt(e.target.value) || 30,
                    }))
                  }
                  min="5"
                  max="180"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passingScore">Passing Score (%)</Label>
                <Input
                  id="passingScore"
                  type="number"
                  value={formData.passingScore}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      passingScore: Number.parseInt(e.target.value) || 70,
                    }))
                  }
                  min="0"
                  max="100"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                />
                <Button type="button" onClick={addTag} size="sm">
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Questions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Questions</h3>
                  <p className="text-sm text-muted-foreground">
                    {formData.questions.length} questions •{" "}
                    {formData.totalPoints} total points
                  </p>
                </div>
                <Button onClick={handleAddQuestion}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>

              {formData.questions.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No questions yet
                    </h3>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      Start building your assessment by adding your first
                      question.
                    </p>
                    <Button onClick={handleAddQuestion}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Question
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {formData.questions.map((question, index) => (
                    <Card
                      key={question.id}
                      className="border-l-4 border-l-blue-500"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base">
                              Q{index + 1}. {question.question}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {question.type === "single"
                                  ? "Single Choice"
                                  : "Multiple Choice"}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {question.points} points
                              </Badge>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs",
                                  question.difficulty === "easy" &&
                                    "border-green-500 text-green-700",
                                  question.difficulty === "medium" &&
                                    "border-yellow-500 text-yellow-700",
                                  question.difficulty === "hard" &&
                                    "border-red-500 text-red-700"
                                )}
                              >
                                {question.difficulty}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditQuestion(index)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteQuestion(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => (
                            <div
                              key={option.id}
                              className={cn(
                                "flex items-center gap-2 p-2 rounded border",
                                option.isCorrect
                                  ? "bg-green-50 border-green-200 text-green-800"
                                  : "bg-gray-50 border-gray-200"
                              )}
                            >
                              {option.isCorrect && (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                              <span className="text-sm font-medium">
                                {String.fromCharCode(65 + optIndex)}.
                              </span>
                              <span className="text-sm">{option.text}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  !formData.title.trim() || formData.questions.length === 0
                }
              >
                {template ? "Update Template" : "Create Template"}
              </Button>
            </div>
          </div>
        ) : (
          /* Question Builder */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">
                {editingQuestionIndex !== null
                  ? "Edit Question"
                  : "Add New Question"}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuestionBuilder(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question">Question</Label>
                <Textarea
                  id="question"
                  value={currentQuestion.question}
                  onChange={(e) =>
                    setCurrentQuestion((prev) => ({
                      ...prev,
                      question: e.target.value,
                    }))
                  }
                  placeholder="Enter your question here..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Question Type</Label>
                  <Select
                    value={currentQuestion.type}
                    onValueChange={(value: "single" | "multiple") =>
                      setCurrentQuestion((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Choice</SelectItem>
                      <SelectItem value="multiple">Multiple Choice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Points</Label>
                  <Input
                    type="number"
                    value={currentQuestion.points}
                    onChange={(e) =>
                      setCurrentQuestion((prev) => ({
                        ...prev,
                        points: Number.parseInt(e.target.value) || 10,
                      }))
                    }
                    min="1"
                    max="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select
                    value={currentQuestion.difficulty}
                    onValueChange={(value: "easy" | "medium" | "hard") =>
                      setCurrentQuestion((prev) => ({
                        ...prev,
                        difficulty: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map((diff) => (
                        <SelectItem key={diff.value} value={diff.value}>
                          <div className="flex items-center gap-2">
                            <div
                              className={cn("w-2 h-2 rounded-full", diff.color)}
                            />
                            {diff.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Answer Options</Label>
                <p className="text-sm text-muted-foreground">
                  {currentQuestion.type === "single"
                    ? "Select one correct answer"
                    : "Select all correct answers"}
                </p>
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={option.id}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium w-6">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {currentQuestion.type === "single" ? (
                        <RadioGroup
                          value={option.isCorrect ? option.id : ""}
                          onValueChange={(value: string) =>
                            handleCorrectAnswerChange(value, true)
                          }
                        >
                          <RadioGroupItem value={option.id} />
                        </RadioGroup>
                      ) : (
                        <Checkbox
                          checked={option.isCorrect}
                          onCheckedChange={(
                            checked: boolean | "indeterminate"
                          ) =>
                            handleCorrectAnswerChange(
                              option.id,
                              checked as boolean
                            )
                          }
                        />
                      )}
                    </div>
                    <Input
                      value={option.text}
                      onChange={(e) =>
                        handleOptionChange(option.id, e.target.value)
                      }
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      className="flex-1"
                    />
                    {option.isCorrect && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="explanation">Explanation (Optional)</Label>
                <Textarea
                  id="explanation"
                  value={currentQuestion.explanation}
                  onChange={(e) =>
                    setCurrentQuestion((prev) => ({
                      ...prev,
                      explanation: e.target.value,
                    }))
                  }
                  placeholder="Explain why this is the correct answer..."
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowQuestionBuilder(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveQuestion}
                disabled={
                  !currentQuestion.question.trim() ||
                  !currentQuestion.options.some((opt) => opt.isCorrect)
                }
              >
                {editingQuestionIndex !== null
                  ? "Update Question"
                  : "Add Question"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
