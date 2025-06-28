"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import LoaderUI from "@/components/LoaderUI";
import { getCandiateInfo, groupInterviews } from "@/lib/utils";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { interviewCategories as INTERVIEW_CATEGORY } from "@/constants";
import { Badge } from "@/components/ui/badge";
import ProtectedRoute from "@/components/protectedComponent";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarIcon,
  CheckCircle2Icon,
  ClockIcon,
  PlusCircleIcon,
  UserIcon,
  XCircleIcon,
  MessageSquareIcon,
  ArrowRightIcon,
} from "lucide-react";
import { format } from "date-fns";
import CommentBox from "@/components/commentBox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";

type Interview = Doc<"interviews"> & {
  comments?: string[];
};

function DashboardPage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  // Redirect to home if user is not authenticated
  // or if userId is not available
  useEffect(() => {
    if (isLoaded && !userId) {
      toast.error("You must be logged in to access this page");
      router.push("/");
    }
  }, [isLoaded, userId, router]);

  const users = useQuery(api.users.getUser);
  const interviews = useQuery(api.interviews.getAllInterviews);
  const updateStatus = useMutation(api.interviews.updateInterview);

  const handleStatusUpdate = async (
    interviewId: Id<"interviews">,
    status: string
  ) => {
    try {
      await updateStatus({ id: interviewId, status });
      toast.success(`Interview marked as ${status}`);
    } catch (e) {
      toast.error("Failed to update status");
      console.error("error updating status:", e);
    }
  };

  if (!interviews || !users) return <LoaderUI />;

  const groupedInterviews = groupInterviews(interviews);
  const activeCategories = INTERVIEW_CATEGORY.filter(
    (category) => groupedInterviews[category.id]?.length > 0
  );

  return (
    <ProtectedRoute allowedRoles={["interviewer"]}>
      <Navbar />

      <div className="container mx-auto py-8 px-4 md:px-6 max-w-7xl">
        {/* Dashboard Header */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Interview Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage and track candidate interviews
              </p>
            </div>
            <Link href="/schedule">
              <Button size="lg" className="gap-2 cursor-pointer">
                <PlusCircleIcon className="h-5 w-5 cursor-pointer" />
                Schedule Interview
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {INTERVIEW_CATEGORY.map((category) => (
              <Card key={category.id} className="bg-card/50">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {category.title}
                    </p>
                    <p className="text-2xl font-bold">
                      {groupedInterviews[category.id]?.length || 0}
                    </p>
                  </div>
                  <Badge
                    variant={category.variant}
                    className="h-8 w-8 rounded-full flex items-center justify-center p-0"
                  >
                    {category.id.charAt(0).toUpperCase()}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tabs for Categories */}
        <Tabs
          defaultValue={activeCategories[0]?.id || "upcoming"}
          className="mb-8"
        >
          <TabsList className="mb-4">
            {activeCategories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="gap-2"
              >
                {category.title}
                <Badge variant={category.variant} className="ml-1">
                  {groupedInterviews[category.id].length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {activeCategories.map((category) => (
            <TabsContent
              key={category.id}
              value={category.id}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedInterviews[category.id].map((interview: Interview) => {
                  const candidateInfo = getCandiateInfo(
                    users,
                    interview.candidateId
                  );
                  const startTime = new Date(interview.startTime);
                  const isCompleted = interview.status === "completed";

                  return (
                    <Card
                      key={interview._id}
                      className="overflow-hidden transition-all hover:shadow-md border-l-4"
                      style={{
                        borderLeftColor:
                          category.id === "upcoming"
                            ? "var(--primary)"
                            : category.id === "completed"
                              ? "var(--success)"
                              : category.id === "failed"
                                ? "var(--destructive)"
                                : "var(--secondary)",
                      }}
                    >
                      <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-muted">
                          <AvatarImage
                            src={candidateInfo?.image || "/placeholder.svg"}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {candidateInfo?.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            {candidateInfo?.name}
                            {interview.status === "succeeded" && (
                              <CheckCircle2Icon className="h-4 w-4 text-green-500" />
                            )}
                            {interview.status === "failed" && (
                              <XCircleIcon className="h-4 w-4 text-destructive" />
                            )}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground font-medium">
                            {interview.title}
                          </p>
                        </div>
                      </CardHeader>

                      <CardContent className="p-4 pt-2">
                        <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{format(startTime, "MMM dd, yyyy")}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <ClockIcon className="h-4 w-4" />
                            <span>{format(startTime, "h:mm a")}</span>
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="p-4 pt-0 flex flex-col gap-3">
                        {isCompleted && (
                          <div className="flex gap-2 w-full">
                            <Button
                              variant="outline"
                              className="flex-1 border-green-200 hover:bg-green-50 hover:text-green-700 text-green-600"
                              onClick={() =>
                                handleStatusUpdate(interview._id, "succeeded")
                              }
                            >
                              <CheckCircle2Icon className="h-4 w-4 mr-2" />
                              Pass
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1 border-red-200 hover:bg-red-50 hover:text-red-700 text-red-600"
                              onClick={() =>
                                handleStatusUpdate(interview._id, "failed")
                              }
                            >
                              <XCircleIcon className="h-4 w-4 mr-2" />
                              Fail
                            </Button>
                          </div>
                        )}

                        <div className="flex gap-2 w-full">
                          <CommentBox interviewId={interview._id}>
                            <Button
                              variant="secondary"
                              className="flex-1 gap-2"
                            >
                              <MessageSquareIcon className="h-4 w-4" />
                              {interview.comments?.length
                                ? `Comments (${interview.comments.length})`
                                : "Add Comment"}
                            </Button>
                          </CommentBox>

                          <Button variant="ghost" size="icon" className="px-2">
                            <ArrowRightIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Alternative Category View */}
        <div className="space-y-8">
          {activeCategories.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <UserIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No interviews scheduled</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                Get started by scheduling your first interview
              </p>
              <Link href="/schedule">
                <Button>Schedule Interview</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default DashboardPage;
