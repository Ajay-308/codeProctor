"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  MoreHorizontal,
  BookOpen,
  Clock,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateAssignmentButton from "@/components/createAssignmentButton";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Navbar from "@/components/Navbar";

// Helper Functions
const getTypeIcon = () => {
  return <BookOpen className="h-4 w-4" />;
};

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
  const label = labelMap[type] || type.charAt(0).toUpperCase() + type.slice(1);

  return <Badge className={`${style} hover:${style}`}>{label}</Badge>;
};
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

// Component
export default function AssignmentsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch assignments from Convex
  const assignments = useQuery(api.assignments.listAssignments) || [];

  const filteredAssignments = Array.isArray(assignments)
    ? assignments.filter((assignment) => {
        const matchesSearch = assignment.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === "all" || assignment.type === activeTab;
        return matchesSearch && matchesTab;
      })
    : [];

  // Calculate stats
  const totalAssignments = assignments.length;

  const activeAssignments = assignments.filter(
    (a) => a.status === "active"
  ).length;

  const totalSubmissions = assignments.reduce(
    (sum, a) => sum + (a.submissionsCount || 0),
    0
  );

  const assignmentsWithScores = assignments.filter(
    (a) => a.avgScore !== null && a.avgScore !== undefined
  );

  const avgScore =
    assignmentsWithScores.length > 0
      ? Math.round(
          assignmentsWithScores.reduce((sum, a) => sum + (a.avgScore || 0), 0) /
            assignmentsWithScores.length
        )
      : 0;

  return (
    <>
      <Navbar />

      <div className="container max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage candidate assessments
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assignments..."
                className="pl-9 w-full sm:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <CreateAssignmentButton />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatCard title="Total Assignments" value={totalAssignments} />
          <StatCard title="Active Assignments" value={activeAssignments} />
          <StatCard title="Total Submissions" value={totalSubmissions} />
          <StatCard title="Average Score" value={`${avgScore}%`} />
        </div>

        {/* Tabs & Filter */}
        <div className="flex items-center justify-between mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="quiz">Quizzes</TabsTrigger>
              <TabsTrigger value="dsa">DSA</TabsTrigger>
              <TabsTrigger value="coding">Coding</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Assignment</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Time Limit</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Avg. Score</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.length > 0 ? (
                  filteredAssignments.map((assignment) => (
                    <TableRow key={assignment._id}>
                      <TableCell>
                        <div className="font-medium">{assignment.title}</div>
                        <div className="text-sm text-muted-foreground">
                          Created on{" "}
                          {new Date(
                            assignment._creationTime
                          ).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon()}
                          {getTypeBadge(assignment.type)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{assignment.timeLimit} min</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {assignment.questions.map((q) => q.question).join(", ")}
                      </TableCell>
                      <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{assignment.submissionsCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {assignment.avgScore !== null
                          ? `${assignment.avgScore}%`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/assignments/${assignment._id}`)
                              }
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/assignments/${assignment._id}/edit`
                                )
                              }
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            <DropdownMenuItem>
                              Send to Candidate
                            </DropdownMenuItem>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6">
                      No assignments found. Create your first assignment to get
                      started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// Component for Stats Display
const StatCard = ({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);
