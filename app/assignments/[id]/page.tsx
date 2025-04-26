/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Clock,
  User,
  BookOpen,
  Calendar,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Id } from "@/convex/_generated/dataModel";

// Define a type for submissions
type Submission = {
  id?: Id<"assignmentSubmissions">;
  candidateId?: Id<"users">;
  candidateName?: string;
  submittedAt?: number;
  completionTime?: number;
  score?: number;
  answers?: Array<{
    questionId: number;
    selectedAnswer: string;
    isCorrect: boolean;
  }>;
};

export default function AssignmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch the specific assignment
  const assignment = useQuery(api.assignments.getAssignment, {
    id: assignmentId,
  });

  // Fetch submissions for this assignment
  const submissions: Submission[] =
    useQuery(api.assignments.getSubmissionsForAssignment, { assignmentId }) ||
    [];

  if (!assignment) {
    return (
      <div className="container max-w-7xl mx-auto p-6 flex items-center justify-center h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading assignment details...</p>
        </div>
      </div>
    );
  }

  // Helper function to get type badge
  const getTypeBadge = (type: string | undefined) => {
    const styleMap: Record<string, string> = {
      general: "bg-blue-100 text-blue-800",
      quiz: "bg-blue-100 text-blue-800",
      dsa: "bg-purple-100 text-purple-800",
      coding: "bg-green-100 text-green-800",
      design: "bg-amber-100 text-amber-800",
    };

    const labelMap: Record<string, string> = {
      general: "Quiz",
      quiz: "Quiz",
      dsa: "DSA",
      coding: "Coding",
      design: "Design",
    };

    if (!type)
      return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;

    const style = styleMap[type] || "bg-gray-100 text-gray-800";
    const label =
      labelMap[type] || type.charAt(0).toUpperCase() + type.slice(1);

    return <Badge className={`${style} hover:${style}`}>{label}</Badge>;
  };

  // Helper function to get status badge
  const getStatusBadge = (status: string | undefined) => {
    if (!status) {
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
          Unknown
        </Badge>
      );
    }

    const isActive = status === "active";

    return (
      <Badge
        className={
          isActive
            ? "bg-green-100 text-green-800 hover:bg-green-100"
            : "bg-gray-100 text-gray-800 hover:bg-gray-100"
        }
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Calculate stats
  const totalSubmissions = submissions.length;
  const passedSubmissions = submissions.filter(
    (sub) => (sub.score || 0) >= (assignment.passingScore || 70)
  ).length;
  const avgScore =
    totalSubmissions > 0
      ? Math.round(
          submissions.reduce((sum, sub) => sum + (sub.score || 0), 0) /
            totalSubmissions
        )
      : 0;

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-8">
      {/* Header with back button */}
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/assignments">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{assignment.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            {getTypeBadge(assignment.type)}
            {getStatusBadge(assignment.status)}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Time Limit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {assignment.timeLimit || "N/A"} min
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{totalSubmissions}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pass Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {totalSubmissions > 0
                  ? `${Math.round((passedSubmissions / totalSubmissions) * 100)}%`
                  : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {totalSubmissions > 0 ? `${avgScore}%` : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Details</CardTitle>
              <CardDescription>
                Basic information about this assignment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Description
                  </h3>
                  <p>{assignment.description || "No description provided."}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Due Date
                    </h3>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {assignment.dueDate
                          ? format(new Date(assignment.dueDate), "PPP")
                          : "No due date"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Passing Score
                    </h3>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span>{assignment.passingScore || 70}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
              <CardDescription>
                Overview of candidate performance on this assignment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {totalSubmissions > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Total Submissions
                      </h3>
                      <p className="text-2xl font-bold">{totalSubmissions}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Passed
                      </h3>
                      <p className="text-2xl font-bold">{passedSubmissions}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Failed
                      </h3>
                      <p className="text-2xl font-bold">
                        {totalSubmissions - passedSubmissions}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">
                        Avg. Completion Time
                      </h3>
                      <p className="text-2xl font-bold">
                        {Math.round(
                          submissions.reduce(
                            (sum: number, sub) =>
                              sum + (sub.completionTime || 0),
                            0
                          ) / totalSubmissions
                        )}{" "}
                        min
                      </p>
                    </div>
                  </div>

                  {/* Simple score distribution visualization */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Score Distribution
                    </h3>
                    <div className="h-8 bg-muted rounded-md overflow-hidden flex">
                      {passedSubmissions > 0 && (
                        <div
                          className="bg-green-500 h-full"
                          style={{
                            width: `${(passedSubmissions / totalSubmissions) * 100}%`,
                          }}
                        />
                      )}
                      {totalSubmissions - passedSubmissions > 0 && (
                        <div
                          className="bg-red-500 h-full"
                          style={{
                            width: `${((totalSubmissions - passedSubmissions) / totalSubmissions) * 100}%`,
                          }}
                        />
                      )}
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No submissions yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Questions</CardTitle>
              <CardDescription>
                Review all questions in this assignment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignment.questions && assignment.questions.length > 0 ? (
                <div className="space-y-6">
                  {assignment.questions.map((question: any, index: number) => (
                    <div
                      key={question.id || index}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">Question {index + 1}</h3>
                        <Badge variant="outline">
                          {question.type || "Multiple Choice"}
                        </Badge>
                      </div>

                      <div>
                        <p className="font-medium">
                          {question.question || question.title}
                        </p>
                        <p className="text-muted-foreground mt-1">
                          {question.content || ""}
                        </p>
                      </div>

                      {question.options && question.options.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Options:</p>
                          <ul className="space-y-1">
                            {question.options.map(
                              (option: string, optIndex: number) => (
                                <li
                                  key={optIndex}
                                  className="flex items-center gap-2"
                                >
                                  <div
                                    className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                                      question.correctAnswer === option
                                        ? "bg-green-100 border-green-500"
                                        : "border-muted"
                                    }`}
                                  >
                                    {question.correctAnswer === option && (
                                      <CheckCircle className="w-3 h-3 text-green-500" />
                                    )}
                                  </div>
                                  <span>{option}</span>
                                  {question.correctAnswer === option && (
                                    <Badge
                                      variant="outline"
                                      className="bg-green-50 text-green-700 ml-2"
                                    >
                                      Correct
                                    </Badge>
                                  )}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No questions found for this assignment
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Candidate Submissions</CardTitle>
              <CardDescription>
                View all submissions for this assignment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submissions.length > 0 ? (
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 font-medium text-sm p-3 border-b bg-muted/50">
                    <div>Candidate</div>
                    <div>Submitted</div>
                    <div>Time Taken</div>
                    <div>Score</div>
                    <div>Status</div>
                  </div>

                  {submissions.map((submission: Submission) => (
                    <div
                      key={submission.id}
                      className="grid grid-cols-5 p-3 border-b last:border-0 items-center text-sm"
                    >
                      <div className="font-medium">
                        {submission.candidateName || "Anonymous"}
                      </div>
                      <div>
                        {submission.submittedAt
                          ? format(new Date(submission.submittedAt), "PPp")
                          : "N/A"}
                      </div>
                      <div>{submission.completionTime || "N/A"} min</div>
                      <div className="font-medium">
                        {submission.score || 0}%
                      </div>
                      <div>
                        {(submission.score || 0) >=
                        (assignment.passingScore || 70) ? (
                          <Badge className="bg-green-100 text-green-800">
                            Passed
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">
                            Failed
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No submissions yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Settings</CardTitle>
              <CardDescription>
                Configure settings for this assignment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium mb-3">General Settings</h3>
                  <ul className="space-y-4">
                    <li className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Status</p>
                        <p className="text-sm text-muted-foreground">
                          Current assignment status
                        </p>
                      </div>
                      {getStatusBadge(assignment.status)}
                    </li>

                    <li className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Time Limit</p>
                        <p className="text-sm text-muted-foreground">
                          Maximum time allowed
                        </p>
                      </div>
                      <span>{assignment.timeLimit || "N/A"} minutes</span>
                    </li>

                    <li className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Passing Score</p>
                        <p className="text-sm text-muted-foreground">
                          Minimum score to pass
                        </p>
                      </div>
                      <span>{assignment.passingScore || 70}%</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3">
                    Candidate Experience
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Proctoring</p>
                        <p className="text-sm text-muted-foreground">
                          Record screen during assessment
                        </p>
                      </div>
                      <Badge variant="outline">{"N/A"}</Badge>
                    </li>

                    <li className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Show Timer</p>
                        <p className="text-sm text-muted-foreground">
                          Display countdown timer
                        </p>
                      </div>
                      <Badge variant="outline">Enabled</Badge>
                    </li>

                    <li className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Randomize Questions</p>
                        <p className="text-sm text-muted-foreground">
                          Present questions in random order
                        </p>
                      </div>
                      <Badge variant="outline">Disabled</Badge>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() =>
                    router.push(`/assignments/${assignmentId}/edit`)
                  }
                >
                  Edit Assignment
                </Button>
                <Button variant="outline">Duplicate</Button>
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
