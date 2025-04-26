"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import toast from "react-hot-toast";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type Question = {
  id: number;
  type: "multiple-choice" | "coding" | "open-ended";
  title: string;
  content: string;
  points: number;
  options: string[];
  correctAnswer: number | null;
};

type FormData = {
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  isProctored: boolean;
  questions: Question[];
  dueDate: number;
};

export default function CreateAssignmentPage() {
  const { user } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignmentType, setAssignmentType] = useState("general");

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    timeLimit: 60,
    passingScore: 70,
    isProctored: false,
    dueDate: Date.now() + 86400 * 1000, // tomorrow
    questions: [
      {
        id: 1,
        type: "multiple-choice",
        title: "",
        content: "",
        points: 10,
        options: ["", "", "", ""],
        correctAnswer: null,
      },
    ],
  });

  const createAssignment = useMutation(api.assignments.createAssignment);

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: Date.now(), // Use timestamp as a quick unique ID
      type: "multiple-choice",
      title: "",
      content: "",
      points: 10,
      options: ["", "", "", ""],
      correctAnswer: null,
    };

    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion],
    });
  };

  const handleRemoveQuestion = (id: number) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((q) => q.id !== id),
    });
  };

  // Update question field
  const updateQuestion = (
    questionId: number,
    field: keyof Question,
    value: string | number | null
  ) => {
    setFormData({
      ...formData,
      questions: formData.questions.map((q) => {
        if (q.id === questionId) {
          return { ...q, [field]: value };
        }
        return q;
      }),
    });
  };

  // Update option for a question
  const updateOption = (
    questionId: number,
    optionIndex: number,
    value: string
  ) => {
    setFormData({
      ...formData,
      questions: formData.questions.map((q) => {
        if (q.id === questionId) {
          const updatedOptions = [...q.options];
          updatedOptions[optionIndex] = value;
          return { ...q, options: updatedOptions };
        }
        return q;
      }),
    });
  };
  if (!user) {
    return null;
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      await createAssignment({
        createdBy: user.id,
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate,
        passingScore: formData.passingScore,
        type: assignmentType, // This needs to be one of the values your UI expects
        timeLimit: formData.timeLimit,
        status: "active", // or you could set to "draft" initially
        questions: formData.questions.map((q) => ({
          id: q.id,
          question: q.title, // Map your title field to question
          options: q.options,
          correctAnswer:
            q.correctAnswer !== null ? q.options[q.correctAnswer] : "",
        })),
      });

      toast.success("Assignment created successfully!");
      router.push("/assignments");
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast.error("Failed to create assignment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/assignments">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Create New Assignment</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Assignment Details</CardTitle>
              <CardDescription>
                Define the basic information for this assignment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Assignment Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., JavaScript Fundamentals Quiz"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this assignment covers..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Assignment Type</Label>
                  <Select
                    value={assignmentType}
                    onValueChange={(value) => setAssignmentType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Quiz</SelectItem>
                      <SelectItem value="dsa">DSA Problem</SelectItem>
                      <SelectItem value="coding">Coding Challenge</SelectItem>
                      <SelectItem value="design">Design Challenge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                  <Input
                    id="time-limit"
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        timeLimit: Number.parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {assignmentType === "dsa" ? (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>DSA Problem</CardTitle>
                <CardDescription>
                  Configure your data structures and algorithms problem
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="problem-statement">Problem Statement</Label>
                  <Textarea
                    id="problem-statement"
                    placeholder="Describe the problem in detail..."
                    rows={6}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select defaultValue="array">
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="array">Arrays</SelectItem>
                        <SelectItem value="string">Strings</SelectItem>
                        <SelectItem value="linkedlist">Linked Lists</SelectItem>
                        <SelectItem value="tree">Trees</SelectItem>
                        <SelectItem value="graph">Graphs</SelectItem>
                        <SelectItem value="dp">Dynamic Programming</SelectItem>
                        <SelectItem value="sorting">
                          Sorting & Searching
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="time-complexity">
                      Expected Time Complexity
                    </Label>
                    <Select defaultValue="o_n">
                      <SelectTrigger>
                        <SelectValue placeholder="Select time complexity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="o_1">O(1)</SelectItem>
                        <SelectItem value="o_log_n">O(log n)</SelectItem>
                        <SelectItem value="o_n">O(n)</SelectItem>
                        <SelectItem value="o_n_log_n">O(n log n)</SelectItem>
                        <SelectItem value="o_n_2">O(n²)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="space-complexity">
                      Expected Space Complexity
                    </Label>
                    <Select defaultValue="o_1">
                      <SelectTrigger>
                        <SelectValue placeholder="Select space complexity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="o_1">O(1)</SelectItem>
                        <SelectItem value="o_log_n">O(log n)</SelectItem>
                        <SelectItem value="o_n">O(n)</SelectItem>
                        <SelectItem value="o_n_log_n">O(n log n)</SelectItem>
                        <SelectItem value="o_n_2">O(n²)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Test Cases</Label>
                  <Card className="border border-muted">
                    <CardContent className="p-4 space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="test-input">Input</Label>
                        <Textarea
                          id="test-input"
                          rows={2}
                          placeholder="[1, 2, 3, 4, 5]"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="test-output">Expected Output</Label>
                        <Textarea id="test-output" rows={1} placeholder="15" />
                      </div>
                    </CardContent>
                  </Card>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add Test Case
                  </Button>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="starter-code">Starter Code</Label>
                  <Textarea
                    id="starter-code"
                    rows={8}
                    className="font-mono text-sm"
                    defaultValue={`/**
 * @param {number[]} nums - Array of integers
 * @return {number} - Sum of all elements
 */
function arraySum(nums) {
  // Your code here
  
}

// Do not modify the code below this line
module.exports = arraySum;`}
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">Questions</h2>
                <Button onClick={handleAddQuestion}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>

              {formData.questions.map((question, index) => (
                <Card key={question.id} className="mb-4">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          Question {index + 1}
                        </span>
                        <Badge variant="outline">
                          {question.points} points
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveQuestion(question.id)}
                        disabled={formData.questions.length === 1}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor={`question-${question.id}-title`}>
                          Question Title
                        </Label>
                        <Input
                          id={`question-${question.id}-title`}
                          value={question.title}
                          onChange={(e) =>
                            updateQuestion(question.id, "title", e.target.value)
                          }
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor={`question-${question.id}-type`}>
                            Question Type
                          </Label>
                          <Select
                            value={question.type}
                            onValueChange={(value) =>
                              updateQuestion(
                                question.id,
                                "type",
                                value as
                                  | "multiple-choice"
                                  | "coding"
                                  | "open-ended"
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="multiple-choice">
                                Multiple Choice
                              </SelectItem>
                              <SelectItem value="coding">Coding</SelectItem>
                              <SelectItem value="open-ended">
                                Open Ended
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor={`question-${question.id}-points`}>
                            Points
                          </Label>
                          <Input
                            id={`question-${question.id}-points`}
                            type="number"
                            value={question.points}
                            onChange={(e) =>
                              updateQuestion(
                                question.id,
                                "points",
                                Number.parseInt(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor={`question-${question.id}-content`}>
                          Question Content
                        </Label>
                        <Textarea
                          id={`question-${question.id}-content`}
                          rows={3}
                          value={question.content}
                          onChange={(e) =>
                            updateQuestion(
                              question.id,
                              "content",
                              e.target.value
                            )
                          }
                          placeholder="Enter your question here..."
                        />
                      </div>

                      {question.type === "multiple-choice" && (
                        <div className="grid gap-2">
                          <Label>Answer Options</Label>
                          {question.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="radio"
                                name={`question-${question.id}-answer`}
                                id={`q${question.id}-opt${optIndex}`}
                                checked={question.correctAnswer === optIndex}
                                onChange={() =>
                                  updateQuestion(
                                    question.id,
                                    "correctAnswer",
                                    optIndex
                                  )
                                }
                                className="h-4 w-4"
                              />
                              <Input
                                value={option}
                                onChange={(e) =>
                                  updateOption(
                                    question.id,
                                    optIndex,
                                    e.target.value
                                  )
                                }
                                placeholder={`Option ${optIndex + 1}`}
                                className="flex-1"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {question.type === "coding" && (
                        <div className="grid gap-2">
                          <Label
                            htmlFor={`question-${question.id}-starter-code`}
                          >
                            Starter Code
                          </Label>
                          <Textarea
                            id={`question-${question.id}-starter-code`}
                            rows={5}
                            className="font-mono text-sm"
                            placeholder="// Provide starter code here"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Assignment Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">General Settings</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="passing-score">Passing Score (%)</Label>
                    <p className="text-sm text-muted-foreground">
                      Minimum score to pass the assignment
                    </p>
                  </div>
                  <Input
                    id="passing-score"
                    type="number"
                    className="w-20"
                    value={formData.passingScore}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        passingScore: Number.parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="proctoring">Enable Proctoring</Label>
                    <p className="text-sm text-muted-foreground">
                      Record screen and webcam during assessment
                    </p>
                  </div>
                  <Switch
                    id="proctoring"
                    checked={formData.isProctored}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isProctored: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="randomize">Randomize Questions</Label>
                    <p className="text-sm text-muted-foreground">
                      Present questions in random order
                    </p>
                  </div>
                  <Switch id="randomize" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Candidate Experience</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="instructions">Show Instructions</Label>
                    <p className="text-sm text-muted-foreground">
                      Display detailed instructions before start
                    </p>
                  </div>
                  <Switch id="instructions" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="timer">Show Timer</Label>
                    <p className="text-sm text-muted-foreground">
                      Display countdown timer during assessment
                    </p>
                  </div>
                  <Switch id="timer" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="feedback">Allow Feedback</Label>
                    <p className="text-sm text-muted-foreground">
                      Let candidates provide feedback after completion
                    </p>
                  </div>
                  <Switch id="feedback" defaultChecked />
                </div>
              </div>

              <Tabs defaultValue="preview">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="share">Share</TabsTrigger>
                </TabsList>
                <TabsContent
                  value="preview"
                  className="p-4 border rounded-md mt-2"
                >
                  <p className="text-sm text-muted-foreground mb-4">
                    Preview how this assessment will appear to candidates
                  </p>
                  <Button className="w-full">Preview Assignment</Button>
                </TabsContent>
                <TabsContent
                  value="share"
                  className="p-4 border rounded-md mt-2"
                >
                  <p className="text-sm text-muted-foreground mb-4">
                    Save assignment before sharing with candidates
                  </p>
                  <Button className="w-full" disabled>
                    Send to Candidates
                  </Button>
                </TabsContent>
              </Tabs>

              <div className="pt-4 border-t">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Creating..." : "Create Assignment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
