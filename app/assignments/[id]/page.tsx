"use client";

import { notFound } from "next/navigation";
import { api } from "@/convex/_generated/api";
import type React from "react";
import { useState, use } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Clock,
  Users,
  BookOpen,
  Calendar,
  CheckCircle,
  AlertCircle,
  Play,
  Edit,
  Share2,
  MoreHorizontal,
  Code,
  FileText,
  Target,
  Timer,
  Award,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AssignmentPageProps {
  params: Promise<{ id: string }>;
}

export default function AssignmentPage({ params }: AssignmentPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  // Unwrap the params Promise using React.use()
  const { id } = use(params);

  const assignment = useQuery(api.assignments.getAssignment, {
    id: id,
  });

  // Mock submissions data - replace with actual query
  const submissions =
    useQuery(api.assignments.getSubmissionsForAssignment, {
      assignmentId: id,
    }) || [];

  if (assignment === undefined) {
    return <AssignmentLoadingSkeleton />;
  }

  if (assignment === null) {
    return notFound();
  }

  // Calculate stats
  const totalSubmissions = submissions.length;
  const completedSubmissions = submissions.filter(
    (sub) => sub.completionTime !== undefined || sub.submittedAt !== undefined
  ).length;
  const avgScore =
    totalSubmissions > 0
      ? Math.round(
          submissions.reduce((sum, sub) => sum + (sub.score || 0), 0) /
            totalSubmissions
        )
      : 0;
  const passRate =
    totalSubmissions > 0
      ? Math.round(
          (submissions.filter(
            (sub) => (sub.score || 0) >= (assignment.passingScore || 70)
          ).length /
            totalSubmissions) *
            100
        )
      : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "archived":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="container max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {assignment.title}
                </h1>
                <Badge
                  className={cn(
                    "font-medium",
                    getStatusColor(assignment.status ?? "")
                  )}
                >
                  {assignment.status
                    ? assignment.status.charAt(0).toUpperCase() +
                      assignment.status.slice(1)
                    : ""}
                </Badge>
              </div>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
                {assignment.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/assignments/${id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Play className="h-4 w-4 mr-2" />
                  Preview Assignment
                </DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Submissions"
            value={totalSubmissions.toString()}
            icon={<Users className="h-5 w-5" />}
            trend="+12% from last week"
            trendUp={true}
          />
          <StatsCard
            title="Completion Rate"
            value={`${Math.round((completedSubmissions / Math.max(totalSubmissions, 1)) * 100)}%`}
            icon={<CheckCircle className="h-5 w-5" />}
            trend={`${completedSubmissions}/${totalSubmissions} completed`}
          />
          <StatsCard
            title="Average Score"
            value={`${avgScore}%`}
            icon={<Award className="h-5 w-5" />}
            trend={`${passRate}% pass rate`}
            trendUp={avgScore >= 70}
          />
          <StatsCard
            title="Time Limit"
            value={`${assignment.timeLimit} min`}
            icon={<Timer className="h-5 w-5" />}
            trend={`${assignment.questions?.length || 0} questions`}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="questions">Questions</TabsTrigger>
                <TabsTrigger value="submissions">Submissions</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <AssignmentOverview
                  assignment={{
                    ...assignment,
                    type: assignment.type ?? "",
                    timeLimit: assignment.timeLimit ?? 0,
                  }}
                />
              </TabsContent>

              <TabsContent value="questions" className="space-y-6">
                <QuestionsTab questions={assignment.questions || []} id={id} />
              </TabsContent>

              <TabsContent value="submissions" className="space-y-6">
                <SubmissionsTab submissions={submissions} />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <AnalyticsTab
                  submissions={submissions}
                  assignment={{
                    ...assignment,
                    type: assignment.type ?? "",
                    timeLimit: assignment.timeLimit ?? 0,
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <AssignmentSidebar
              assignment={{
                ...assignment,
                type: assignment.type ?? "",
                timeLimit: assignment.timeLimit ?? 0,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading Skeleton Component
function AssignmentLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="container max-w-7xl mx-auto p-6 space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="w-64 h-8 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="w-96 h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm"
            >
              <div className="w-full h-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="w-full h-96 bg-white dark:bg-slate-800 rounded-xl shadow-sm animate-pulse" />
          </div>
          <div>
            <div className="w-full h-64 bg-white dark:bg-slate-800 rounded-xl shadow-sm animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Stats Card Component
function StatsCard({
  title,
  value,
  icon,
  trend,
  trendUp,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <Card className="bg-white dark:bg-slate-800 border-0 shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {title}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {value}
            </p>
            {trend && (
              <p
                className={cn(
                  "text-xs",
                  trendUp === true
                    ? "text-green-600"
                    : trendUp === false
                      ? "text-red-600"
                      : "text-slate-500"
                )}
              >
                {trend}
              </p>
            )}
          </div>
          <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-full">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Assignment Overview Component
interface Assignment {
  _id: string;
  _creationTime: string | number | Date;
  title: string;
  description?: string;
  status?: string;
  type: string;
  timeLimit: number;
  passingScore?: number;
  dueDate?: string | number | Date;
  questions?: {
    question: string;
    content?: string;
    options?: string[];
  }[];
  tags?: string[];
}

function AssignmentOverview({ assignment }: { assignment: Assignment }) {
  return (
    <Card className="bg-white dark:bg-slate-800 border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Assignment Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Type
              </h3>
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                <span className="capitalize">{assignment.type}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Time Limit
              </h3>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500" />
                <span>{assignment.timeLimit} minutes</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Passing Score
              </h3>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-slate-500" />
                <span>{assignment.passingScore || 70}%</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Due Date
              </h3>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span>
                  {assignment.dueDate
                    ? format(new Date(assignment.dueDate), "PPP")
                    : "No due date set"}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Questions
              </h3>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-500" />
                <span>{assignment.questions?.length || 0} questions</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Created
              </h3>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span>{format(new Date(assignment._creationTime), "PPP")}</span>
              </div>
            </div>
          </div>
        </div>

        {assignment.tags && assignment.tags.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {assignment.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Questions Tab Component
interface Question {
  question: string;
  content?: string;
  options?: string[];
}

function QuestionsTab({
  questions,
  id,
}: {
  questions: Question[];
  id: string;
}) {
  return (
    <div className="space-y-4">
      {questions.length > 0 ? (
        questions.map((question, index) => (
          <Card
            key={index}
            className="bg-white dark:bg-slate-800 border-0 shadow-md"
          >
            <CardHeader>
              <CardTitle className="text-lg">Question {index + 1}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">{question.question}</h4>
                  {question.content && (
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      {question.content}
                    </p>
                  )}
                </div>

                {question.options && question.options.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">Options:</h5>
                    <div className="space-y-2">
                      {question.options.map(
                        (option: string, optIndex: number) => (
                          <div
                            key={optIndex}
                            className="flex items-center gap-2"
                          >
                            <div className="w-4 h-4 rounded-full border flex items-center justify-center border-slate-300">
                              {/* Placeholder for correct answer icon */}
                            </div>
                            <span className="text-sm">{option}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card className="bg-white dark:bg-slate-800 border-0 shadow-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Questions Added</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              This assignment doesn&#39;t have any questions yet.
            </p>
            <Button asChild>
              <Link href={`/assignments/${id}/edit`}>Add Questions</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Submissions Tab Component
interface Submission {
  candidateName?: string;
  submittedAt?: string | number | Date;
  score?: number;
  completionTime?: string | number | Date;
  status?: string;
}

function SubmissionsTab({ submissions }: { submissions: Submission[] }) {
  return (
    <Card className="bg-white dark:bg-slate-800 border-0 shadow-md">
      <CardHeader>
        <CardTitle>Recent Submissions</CardTitle>
      </CardHeader>
      <CardContent>
        {submissions.length > 0 ? (
          <div className="space-y-4">
            {submissions.slice(0, 10).map((submission, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {submission.candidateName || "Anonymous"}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {submission.submittedAt
                        ? format(new Date(submission.submittedAt), "PPp")
                        : "Not submitted"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{submission.score || 0}%</p>
                  <Badge
                    variant={
                      (submission.score ?? 0) >= 70 ? "default" : "destructive"
                    }
                    className="text-xs"
                  >
                    {(submission.score ?? 0) >= 70 ? "Passed" : "Failed"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Submissions Yet</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Submissions will appear here once candidates start taking the
              assignment.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Analytics Tab Component
function AnalyticsTab({
  submissions,
  assignment,
}: {
  submissions: Submission[];
  assignment: Assignment;
}) {
  const completionRate =
    submissions.length > 0
      ? (submissions.filter((s) => s.status === "completed").length /
          submissions.length) *
        100
      : 0;

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-slate-800 border-0 shadow-md">
        <CardHeader>
          <CardTitle>Performance Analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Completion Rate</span>
              <span className="text-sm text-slate-600">
                {Math.round(completionRate)}%
              </span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {submissions.length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Total Attempts
              </p>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {
                  submissions.filter(
                    (s) => (s.score ?? 0) >= (assignment.passingScore || 70)
                  ).length
                }
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Passed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Assignment Sidebar Component
function AssignmentSidebar({ assignment }: { assignment: Assignment }) {
  function getStatusColor(status: string) {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "archived":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }
  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-slate-800 border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full" asChild>
            <Link href={`/assignments/${assignment._id}/schedule`}>
              <Users className="h-4 w-4 mr-2" />
              Send to Candidates
            </Link>
          </Button>
          <Button variant="outline" className="w-full bg-transparent" asChild>
            <Link href={`/assignments/${assignment._id}/preview`}>
              <Play className="h-4 w-4 mr-2" />
              Preview Assignment
            </Link>
          </Button>
          <Button variant="outline" className="w-full bg-transparent" asChild>
            <Link href={`/assignments/${assignment._id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Assignment
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-slate-800 border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Assignment Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Status
            </span>
            <Badge className={getStatusColor(assignment.status ?? "")}>
              {(assignment.status ?? "")
                ? (assignment.status ?? "").charAt(0).toUpperCase() +
                  (assignment.status ?? "").slice(1)
                : ""}
            </Badge>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Type
            </span>
            <span className="text-sm font-medium capitalize">
              {assignment.type}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Questions
            </span>
            <span className="text-sm font-medium">
              {assignment.questions?.length || 0}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Time Limit
            </span>
            <span className="text-sm font-medium">
              {assignment.timeLimit} min
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Passing Score
            </span>
            <span className="text-sm font-medium">
              {assignment.passingScore || 70}%
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
