"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import useUserRole from "@/hooks/useUserRole";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import LoaderUI from "@/components/LoaderUI";
import Navbar from "@/components/Navbar";
import { quickActions } from "@/constants";
import { Calendar, Clock, Code, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  const router = useRouter();
  const { isInterviewer, isLoading } = useUserRole();
  const interviews = useQuery(api.interviews.getInterview);

  const [, setShowModal] = useState(false);
  const [, setModalType] = useState<"start" | "join">("start");

  const handleQuickActionClick = (title: string) => {
    if (title === "New Call") {
      setModalType("start");
      setShowModal(true);
    } else if (title === "Join Interview") {
      setModalType("join");
      setShowModal(true);
    } else {
      router.push(`/${title.toLowerCase()}`);
    }
  };

  if (isLoading) return <LoaderUI />;

  // Function to format date in a readable way
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  };

  const getActionIcon = (title: string) => {
    switch (title) {
      case "New Call":
        return <Code className="h-8 w-8" />;
      case "Join Interview":
        return <Users className="h-8 w-8" />;
      case "Schedule":
        return <Calendar className="h-8 w-8" />;
      case "Recordings":
        return <Clock className="h-8 w-8" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container max-w-7xl mx-auto p-6">
        {/* Welcome Card */}
        <Card className="mb-8 border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">
              Welcome to CodeProctor
            </CardTitle>
            <CardDescription className="text-gray-600">
              {isInterviewer
                ? "You are logged in as an interviewer"
                : "You are logged in as a candidate"}
            </CardDescription>
          </CardHeader>
        </Card>

        {isInterviewer ? (
          <div className="space-y-8">
            <h2 className="text-xl font-semibold text-gray-800">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Card
                  key={action.title}
                  className="bg-blue-50 border-none hover:bg-blue-100 transition-colors cursor-pointer"
                  onClick={() => handleQuickActionClick(action.title)}
                >
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="rounded-full bg-white p-3 mb-4 shadow-sm">
                      {getActionIcon(action.title)}
                    </div>
                    <h3 className="font-bold text-lg mb-1">{action.title}</h3>
                    <p className="text-gray-600 text-sm">
                      {action.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                Your Upcoming Interviews
              </h2>
              <Button
                variant="outline"
                onClick={() => router.push("/schedule")}
                className="text-gray-600"
              >
                View All
              </Button>
            </div>

            {interviews === undefined ? (
              <div className="flex justify-center items-center py-12">
                <LoaderUI />
              </div>
            ) : interviews.length === 0 ? (
              <Card className="bg-gray-50 border border-dashed border-gray-300">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    No Upcoming Interviews
                  </h3>
                  <p className="text-gray-500 max-w-md">
                    You don&apos;t have any interviews scheduled at the moment.
                    Check back later or contact your recruiter.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {interviews.map((interview) => (
                  <Card
                    key={interview._id}
                    className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-2 bg-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg font-bold">
                            {interview.title}
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-600 mt-1">
                            {interview.description}
                          </CardDescription>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          Upcoming
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          {formatDate(interview.startTime.toString())}
                        </span>
                      </div>
                      {interview.endTime && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>
                            Duration:{" "}
                            {Math.round(
                              (new Date(interview.endTime).getTime() -
                                new Date(interview.startTime).getTime()) /
                                (1000 * 60)
                            )}{" "}
                            minutes
                          </span>
                        </div>
                      )}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <Button
                          className="w-full"
                          onClick={() =>
                            router.push(`/interview/${interview._id}`)
                          }
                        >
                          Join Interview
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
