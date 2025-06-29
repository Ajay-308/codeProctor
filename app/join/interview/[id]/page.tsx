"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Loader2,
  AlertCircle,
  Video,
  Users,
  ExternalLink,
  Calendar,
} from "lucide-react";
import Navbar from "@/components/Navbar";

interface InterviewData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export default function JoinInterviewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState<InterviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const interviewId = params?.id as string;
  const userType = searchParams?.get("type");
  const token = searchParams?.get("token");

  useEffect(() => {
    const fetchInterviewData = async () => {
      try {
        setLoading(true);

        const apiUrl = new URL(
          `/api/interviews/${interviewId}`,
          window.location.origin
        );
        if (userType) apiUrl.searchParams.set("type", userType);
        if (token) apiUrl.searchParams.set("token", token);

        const response = await fetch(apiUrl.toString());

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        setInterview(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load interview"
        );
      } finally {
        setLoading(false);
      }
    };

    if (interviewId) {
      fetchInterviewData();
    }
  }, [interviewId, userType, token]);

  const handleJoinInterview = async () => {
    try {
      const joinUrl =
        interview?.joinUrl || interview?.link || interview?.meetingUrl;

      if (joinUrl) {
        window.open(joinUrl, "_blank");
      } else {
        router.push(
          `/interview-room/${interviewId}${userType ? `?type=${userType}` : ""}`
        );
      }
    } catch (err) {
      console.error("Failed to join interview:", err);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
      },
      "awaiting decision": {
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-200",
      },
      "in progress": {
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-200",
      },
      completed: {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
      },
      finalized: {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
      },
      active: {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
      },
    };

    const config =
      statusConfig[status?.toLowerCase() as keyof typeof statusConfig] ||
      statusConfig.scheduled;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
      >
        {status}
      </span>
    );
  };

  // Loading state matching your design
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        {/* Loading content */}
        <div
          className="flex items-center justify-center"
          style={{ height: "calc(100vh - 64px)" }}
        >
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600 text-sm">Loading interview...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div
          className="flex items-center justify-center"
          style={{ height: "calc(100vh - 64px)" }}
        >
          <div className="text-center max-w-md mx-auto p-6">
            <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Unable to Load Interview
              </h1>
              <p className="text-gray-600 mb-6 text-sm">{error}</p>
              <div className="space-x-3">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="bg-white text-gray-700 px-4 py-2 rounded-md text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div
          className="flex items-center justify-center"
          style={{ height: "calc(100vh - 64px)" }}
        >
          <div className="text-center">
            <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Interview Not Found
              </h1>
              <p className="text-gray-600 mb-4 text-sm">
                The interview you&#39;re looking for doesn&#39;t exist or has
                been removed.
              </p>
              <button
                onClick={() => router.push("/")}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main interview page
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header matching your design */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-1 hover:bg-gray-100 rounded"
              >
                {/* <ChevronLeft className="h-5 w-5 text-gray-600" /> */}
              </button>
              <div className="flex items-center space-x-2">
                <div className="text-xl font-bold text-gray-900">
                  <span className="text-blue-600">{"<>"}</span> CodeProctor
                </div>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-500 hover:text-gray-900 text-sm">
                Home
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 text-sm">
                Dashboard
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 text-sm">
                Candidates
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 text-sm">
                Templates
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 text-sm">
                Docs
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              {/* <Bell className="h-5 w-5 text-gray-400" /> */}
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                {/* <User className="h-4 w-4 text-white" /> */}
              </div>
              {/* <Settings className="h-5 w-5 text-gray-400" /> */}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Join Interview
          </h1>
          <p className="text-gray-600 text-sm">
            Interview session details and access
          </p>
        </div>

        {/* Interview Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  {interview.title || interview.name || "Interview Session"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">ID: {interviewId}</p>
              </div>
              <div className="flex items-center space-x-3">
                {userType && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                    {userType}
                  </span>
                )}
                {interview.status && getStatusBadge(interview.status)}
              </div>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-6">
            {/* Key Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Schedule */}
              {(interview.scheduledTime ||
                interview.startTime ||
                interview.dateTime) && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Schedule
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {interview.scheduledTime ||
                        interview.startTime ||
                        interview.dateTime}
                    </p>
                    {interview.duration && (
                      <p className="text-xs text-gray-500 mt-1">
                        Duration: {interview.duration}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Participants */}
              {(interview.participants ||
                interview.candidate ||
                interview.interviewer) && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Participants
                    </p>
                    <div className="mt-1 space-y-1">
                      {interview.candidate && (
                        <p className="text-sm text-gray-600">
                          Candidate:{" "}
                          {interview.candidate.name || interview.candidate}
                        </p>
                      )}
                      {interview.interviewer && (
                        <p className="text-sm text-gray-600">
                          Interviewer:{" "}
                          {interview.interviewer.name || interview.interviewer}
                        </p>
                      )}
                      {interview.participants &&
                        Array.isArray(interview.participants) &&
                        interview.participants
                          .slice(0, 2)
                          .map((participant: unknown, index: number) => {
                            if (
                              typeof participant === "object" &&
                              participant !== null
                            ) {
                              const p = participant as {
                                name?: string;
                                role?: string;
                              };
                              return (
                                <p
                                  key={index}
                                  className="text-sm text-gray-600"
                                >
                                  {p.name || JSON.stringify(participant)}
                                  {p.role && ` (${p.role})`}
                                </p>
                              );
                            }
                            return (
                              <p key={index} className="text-sm text-gray-600">
                                {String(participant)}
                              </p>
                            );
                          })}
                    </div>
                  </div>
                </div>
              )}

              {/* Meeting Type */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Video className="h-5 w-5 text-gray-400 mt-0.5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Meeting Type
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {interview.joinUrl || interview.link || interview.meetingUrl
                      ? "External Meeting"
                      : "CodeProctor Room"}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {interview.description && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Description
                </h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                  {interview.description}
                </p>
              </div>
            )}

            {/* Dynamic Additional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {Object.entries(interview)
                .filter(
                  ([key]) =>
                    ![
                      "title",
                      "name",
                      "scheduledTime",
                      "startTime",
                      "dateTime",
                      "duration",
                      "participants",
                      "candidate",
                      "interviewer",
                      "status",
                      "joinUrl",
                      "link",
                      "meetingUrl",
                      "description",
                      "id",
                    ].includes(key) && !key.startsWith("_")
                )
                .map(([key, value]) => (
                  <div key={key} className="bg-gray-50 p-3 rounded-md">
                    <p className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </p>
                    <p className="text-sm text-gray-900">
                      {typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value)}
                    </p>
                  </div>
                ))}
            </div>

            {/* Join Button */}
            <div className="flex justify-center pt-6 border-t border-gray-200">
              <button
                onClick={handleJoinInterview}
                className="inline-flex items-center px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors space-x-2"
              >
                <Video className="h-4 w-4" />
                <span>Join Interview</span>
                {(interview.joinUrl ||
                  interview.link ||
                  interview.meetingUrl) && <ExternalLink className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
