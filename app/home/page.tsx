"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import useUserRole from "@/hooks/useUserRole";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LoaderUI from "@/components/LoaderUI";
import Navbar from "@/components/Navbar";
import MeetingModel from "@/components/MeetingModel";
import MeetingCard from "@/components/MeetingCard";
import { useMeetingActions } from "@/hooks/useMeetingActions";
import { quickActions } from "@/constants";
import {
  Calendar,
  Clock,
  Code,
  Users,
  Loader2 as Loader2Icon,
  FileIcon,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { isInterviewer, isLoading } = useUserRole();
  const interviews = useQuery(api.interviews.getInterview);
  const { userId, isLoaded } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"start" | "join">("start");
  const { createInstantMeeting } = useMeetingActions();

  // candidate count , upcoming interviews , completed interviews
  const users = useQuery(api.users.getUser);
  const candidateCount =
    users?.filter((user) => user.role === "candidate").length ?? 0;
  const Interview = useQuery(api.interviews.getInterviewByInterviewerId, {
    interviewerId: userId ?? "",
  });
  console.log("Interview", Interview);
  const upcomingInterviews =
    Interview?.filter((i) => i.status === "upcoming").length ?? 0;
  console.log("upcoming Interviews", upcomingInterviews);
  const pastInterviews =
    Interview?.filter((i) => i.status === "completed").length ?? 0;
  ////const completedInterviews = Interview ?.
  console.log("pastInterviews", pastInterviews);
  //console.log("completedInterviews", completedInterviews);

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/");
    }
  }, [isLoaded, userId, router]);

  const handleQuickActionClick = (title: string) => {
    if (title === "New Call") {
      createInstantMeeting();
    } else if (title === "Join Interview") {
      setModalType("join");
      setShowModal(true);
    } else {
      router.push(`/${title.toLowerCase()}`);
    }
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

  if (isLoading) return <LoaderUI />;

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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent>
                  <div className="flex items-center">
                    <div className="mr-4 rounded-full bg-blue-100 p-3">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Candidates
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {candidateCount}
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100">
                <CardContent>
                  <div className="flex items-center">
                    <div className="mr-4 rounded-full bg-green-100 p-3">
                      <Clock className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Upcoming Interviews
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {upcomingInterviews}
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent>
                  <div className="flex items-center">
                    <div className="mr-4 rounded-full bg-purple-100 p-3">
                      <FileIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Active Templates
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900">15</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
                <CardContent>
                  <div className="flex items-center">
                    <div className="mr-4 rounded-full bg-orange-100 p-3">
                      <Code className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Completed Interviews
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {pastInterviews}
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
            <MeetingModel
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              title={modalType === "join" ? "Join Meeting" : "Start Meeting"}
              isJoinMeeting={modalType === "join"}
              onSubmit={() => {
                console.log("Meeting submitted");
              }}
              isLoading={false}
            />
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-3xl font-bold">Your Interviews</h1>
              <p className="text-muted-foreground mt-1">
                View and join your scheduled interviews
              </p>
            </div>

            <div className="mt-8">
              {interviews === undefined ? (
                <div className="flex justify-center py-12">
                  <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : interviews.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {interviews.map((interview) => (
                    <MeetingCard key={interview._id} interview={interview} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  You have no scheduled interviews at the moment
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
