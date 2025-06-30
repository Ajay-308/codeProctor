"use client";

import type React from "react";
import { useState, useCallback, useEffect, useRef } from "react";
import { Mail, CalendarIcon, X, Plus } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Calendar from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import toast from "react-hot-toast";

interface Candidate {
  id: string;
  name: string;
  email: string;
  position: string;
  status:
    | "applied"
    | "screening"
    | "interview"
    | "technical"
    | "offer"
    | "rejected";
  lastActivity: string;
  avatarUrl?: string;
  score?: number;
  tags: string[];
  scheduledInterviews?: Date[];
  rejectedDates?: Date[];
}

interface InterviewerInfo {
  name: string;
  email: string;
}

const statusLabels: Record<
  Candidate["status"],
  { label: string; variant: string }
> = {
  applied: { label: "Applied", variant: "default" },
  screening: { label: "Screening", variant: "secondary" },
  interview: { label: "Interview", variant: "secondary" },
  technical: { label: "Technical", variant: "outline" },
  offer: { label: "Offer", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
};

interface CandidateCardProps {
  candidate: Candidate;
  onClick?: () => void;
}

type ActiveView = null | "email" | "calendar";

const interviewStatusColors = {
  upcoming: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
    icon: "text-emerald-600",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  today: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-black",
    icon: "text-blue-600",
    badge: "bg-blue-100 text-blue-800 border-blue-300",
  },
  tomorrow: {
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-800",
    icon: "text-indigo-600",
    badge: "bg-indigo-100 text-indigo-800 border-indigo-300",
  },
  thisWeek: {
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-800",
    icon: "text-violet-600",
    badge: "bg-violet-100 text-violet-800 border-violet-300",
  },
  past: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    icon: "text-amber-600",
    badge: "bg-amber-100 text-amber-800 border-amber-300",
  },
};

const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  onClick,
}) => {
  const [activeView, setActiveView] = useState<ActiveView>(null);
  const interviews = useQuery(api.interviews.getAllInterviews);
  const [interviewerInfo, setInterviewerInfo] = useState<InterviewerInfo[]>([
    { name: "", email: "" },
  ]);
  const [formData, setFormData] = useState({
    date: new Date(),
    time: "09:00",
    notes: "",
  });
  const [scheduledDates, setScheduledDates] = useState<Date[]>([]);
  const isMounted = useRef(true);

  const createInterview = useMutation(
    api.action.interview.createInterviewWithUUID
  );
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Utility function to normalize dates to start of day for comparison
  const normalizeDate = useCallback((date: Date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }, []);

  useEffect(() => {
    if (!interviews || !Array.isArray(interviews)) return;

    const candidateInterviews = interviews.filter(
      (interview) => interview.candidateId === candidate.id
    );

    const dates = candidateInterviews.map((interview) => {
      return normalizeDate(new Date(interview.startTime));
    });

    if (isMounted.current) {
      setScheduledDates(dates);
    }
  }, [interviews, candidate.id, normalizeDate]);

  const handleCardClick = () => {
    if (activeView === null && onClick) {
      onClick();
    }
  };

  const handleEmailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveView(activeView === "email" ? null : "email");
  };

  const handleScheduleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveView(activeView === "calendar" ? null : "calendar");
  };

  const closeView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveView(null);
  };

  // Functions to handle interviewer management
  const addInterviewer = () => {
    setInterviewerInfo([...interviewerInfo, { name: "", email: "" }]);
  };

  const removeInterviewer = (index: number) => {
    if (interviewerInfo.length > 1) {
      setInterviewerInfo(interviewerInfo.filter((_, i) => i !== index));
    }
  };

  const updateInterviewer = (
    index: number,
    field: "name" | "email",
    value: string
  ) => {
    const updated = interviewerInfo.map((interviewer, i) =>
      i === index ? { ...interviewer, [field]: value } : interviewer
    );
    setInterviewerInfo(updated);
  };

  const isSameDay = useCallback(
    (date1: Date, date2: Date) => {
      const normalized1 = normalizeDate(date1);
      const normalized2 = normalizeDate(date2);
      return normalized1.getTime() === normalized2.getTime();
    },
    [normalizeDate]
  );

  const isDateScheduled = useCallback(
    (date: Date) => {
      const normalizedDate = normalizeDate(date);
      return scheduledDates.some(
        (scheduledDate) => scheduledDate.getTime() === normalizedDate.getTime()
      );
    },
    [scheduledDates, normalizeDate]
  );

  const handleSubmitSchedule = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!formData.date) {
        toast.error("Please select a date.");
        return;
      }

      // Validate interviewer information
      const validInterviewers = interviewerInfo.filter(
        (interviewer) => interviewer.name.trim() && interviewer.email.trim()
      );

      if (validInterviewers.length === 0) {
        toast.error("Please add at least one interviewer with name and email.");
        return;
      }

      const selectedDate = normalizeDate(formData.date);

      // Check if there's already an interview scheduled on this date
      if (isDateScheduled(selectedDate)) {
        toast.error(
          "Interview already scheduled on this day. Please select a different date."
        );
        return;
      }

      if (interviews && Array.isArray(interviews)) {
        const candidateInterviews = interviews.filter(
          (interview) => interview.candidateId === candidate.id
        );

        const hasExistingInterview = candidateInterviews.some((interview) => {
          const interviewDate = normalizeDate(new Date(interview.startTime));
          return interviewDate.getTime() === selectedDate.getTime();
        });

        if (hasExistingInterview) {
          toast.error(
            "Interview already exists on this date. Please choose another date."
          );
          return;
        }
      }

      const interviewDate = new Date(formData.date);
      const [hours, minutes] = formData.time.split(":").map(Number);
      interviewDate.setHours(hours, minutes);

      const startTime = interviewDate.getTime();

      try {
        // Extract interviewer IDs (you might need to adjust this based on your data structure)
        const interviewerIds = validInterviewers.map(
          (_, index) => `interviewer${index + 1}`
        );

        await createInterview({
          candidateId: candidate.id,
          startTime,
          description: formData.notes,
          status: "scheduled",
          title: `${candidate.name} Interview`,
          streamCallId: "default-stream-id",
          interviewerIds,
        });

        toast.success("Interview scheduled successfully!");

        try {
          const res = await fetch("/api/sent", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: candidate.name,
              email: candidate.email,
              interviewDate,
              link: "https://code-proctor.vercel.app/home",
              interviewers: validInterviewers,
            }),
          });

          const data = await res.json();
          if (res.ok) {
            toast.success("Interview email sent successfully!");
          } else {
            toast.error("Failed to send email: " + data.message);
          }
        } catch (err) {
          console.error("Email error:", err);
          toast.error("Something went wrong while sending the email.");
        }

        // Reset state
        setActiveView(null);
        setFormData({
          date: new Date(),
          time: "09:00",
          notes: "",
        });
        setInterviewerInfo([{ name: "", email: "" }]);
      } catch (error) {
        console.error("Failed to schedule interview:", error);
        toast.error("Failed to schedule interview. Please try again.");
      }
    },
    [
      candidate.id,
      candidate.name,
      candidate.email,
      formData,
      interviewerInfo,
      createInterview,
      isDateScheduled,
      interviews,
      normalizeDate,
      setActiveView,
      setFormData,
    ]
  );

  const formatInterviewDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });
    const month = date.toLocaleDateString("en-US", { month: "long" });
    const day = date.getDate();
    const time = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    return `${dayOfWeek}, ${month} ${day} · ${time}`;
  };

  const isTodayDate = useCallback(
    (date: Date) => {
      const today = new Date();
      return isSameDay(today, date);
    },
    [isSameDay]
  );

  const isTomorrowDate = useCallback(
    (date: Date) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return isSameDay(tomorrow, date);
    },
    [isSameDay]
  );

  const isThisWeekDate = useCallback((date: Date) => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    return date > today && date <= nextWeek;
  }, []);

  const getInterviewStatusLabel = useCallback((status: string) => {
    switch (status) {
      case "past":
        return "Past";
      case "today":
        return "Today";
      case "tomorrow":
        return "Tomorrow";
      case "thisWeek":
        return "This Week";
      default:
        return "Upcoming";
    }
  }, []);

  const isPastOrToday = useCallback(
    (date: Date) => {
      const today = normalizeDate(new Date());
      const compareDate = normalizeDate(date);
      return compareDate.getTime() <= today.getTime();
    },
    [normalizeDate]
  );

  // Filter and sort interviews for this candidate
  const candidateInterviews = Array.isArray(interviews)
    ? interviews.filter((interview) => interview.candidateId === candidate.id)
    : [];

  const sortedInterviews = candidateInterviews.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const pastInterviews = sortedInterviews.filter((i) => {
    const interviewDate = new Date(i.startTime);
    return interviewDate < new Date();
  });

  const upcomingInterviews = sortedInterviews.filter((i) => {
    return !pastInterviews.includes(i);
  });

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-shadow duration-300",
        activeView === null && "hover:shadow-lg cursor-pointer"
      )}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center">
          <Avatar className="h-12 w-12">
            {candidate.avatarUrl ? (
              <AvatarImage
                src={candidate.avatarUrl || "/placeholder.svg"}
                alt={candidate.name}
              />
            ) : (
              <AvatarFallback className="bg-blue-500 text-white">
                {candidate.name.charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="ml-3">
            <h3 className="font-medium text-gray-900">{candidate.name}</h3>
            <p className="text-sm text-gray-500">{candidate.position}</p>
          </div>
        </div>

        <div className="mt-4">
          <Badge
            variant={
              statusLabels[candidate.status].variant as
                | "default"
                | "secondary"
                | "outline"
                | "destructive"
            }
          >
            {statusLabels[candidate.status].label}
          </Badge>
          <div className="mt-2 text-sm text-gray-500">
            <span>
              Last activity:{" "}
              {new Date(candidate.lastActivity).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Show upcoming interviews section */}
        {upcomingInterviews.length > 0 && activeView === null && (
          <div className="mt-4 p-3 border rounded-md bg-gradient-to-r from-blue-50 to-emerald-50">
            <h4 className="font-medium text-blue-800 flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              Upcoming{" "}
              {upcomingInterviews.length > 1 ? "Interviews" : "Interview"}
            </h4>
            <div className="mt-2 space-y-2">
              {upcomingInterviews.slice(0, 2).map((interview, index) => {
                const interviewDate = new Date(interview.startTime);
                let status = "upcoming";

                // Determine the correct status
                if (isTodayDate(interviewDate)) {
                  status = "today";
                } else if (isTomorrowDate(interviewDate)) {
                  status = "tomorrow";
                } else if (isThisWeekDate(interviewDate)) {
                  status = "thisWeek";
                }

                const colors =
                  interviewStatusColors[
                    status as keyof typeof interviewStatusColors
                  ];

                return (
                  <div
                    key={`upcoming-${interview._id || index}`}
                    className={cn(
                      "p-2 rounded shadow-sm",
                      colors.bg,
                      colors.border
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CalendarIcon
                          className={cn("h-3 w-3 mr-1", colors.icon)}
                        />
                        <span
                          className={cn("text-sm font-medium", colors.text)}
                        >
                          {formatInterviewDate(interview.startTime)}
                        </span>
                      </div>
                      <Badge variant="outline" className={colors.badge}>
                        {getInterviewStatusLabel(status)}
                      </Badge>
                    </div>
                    {interview.description && (
                      <p className="text-xs text-gray-600 mt-1">
                        {interview.description}
                      </p>
                    )}
                  </div>
                );
              })}
              {upcomingInterviews.length > 2 && (
                <p className="text-xs text-blue-600 mt-1">
                  +{upcomingInterviews.length - 2} more scheduled
                </p>
              )}
            </div>
          </div>
        )}

        {pastInterviews.length > 0 &&
          activeView === null &&
          upcomingInterviews.length > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              {pastInterviews.length} past{" "}
              {pastInterviews.length === 1 ? "interview" : "interviews"}
            </div>
          )}

        {candidate.score !== undefined && (
          <div className="mt-4">
            <div className="text-sm font-medium text-gray-700">Score</div>
            <div className="mt-1 flex items-center">
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className={cn(
                    "h-full",
                    candidate.score >= 90
                      ? "bg-green-500"
                      : candidate.score >= 70
                        ? "bg-blue-500"
                        : candidate.score >= 50
                          ? "bg-yellow-500"
                          : "bg-red-500"
                  )}
                  style={{ width: `${candidate.score}%` }}
                />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">
                {candidate.score}%
              </span>
            </div>
          </div>
        )}

        <div className="mt-4">
          <div className="text-sm font-medium text-gray-700">Skills</div>
          <div className="mt-1 flex flex-wrap gap-1">
            {candidate.tags?.map((tag, index) => (
              <Badge key={index} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {activeView === "email" && (
          <div className="mt-4 p-3 border rounded-md bg-gray-50 relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1"
              onClick={closeView}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium mb-2">Contact via Email</div>
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-gray-500" />
              <a
                href={`mailto:${candidate.email}`}
                className="text-sm text-blue-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {candidate.email}
              </a>
            </div>
          </div>
        )}

        {activeView === "calendar" && (
          <div className="mt-4 border rounded-md bg-gray-50 p-3 relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1"
              onClick={closeView}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="text-sm cursor-pointer font-medium mb-2">
              Interview Schedule
            </div>

            {sortedInterviews.length > 0 && (
              <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-md">
                <h4 className="text-sm font-medium text-blue-800 mb-2">
                  All Interviews ({sortedInterviews.length})
                </h4>
                <div className="space-y-2 max-h-40 overflow-auto">
                  {sortedInterviews.map((interview, index) => {
                    const interviewDate = new Date(interview.startTime);
                    let status = "upcoming";

                    if (interviewDate < new Date()) {
                      status = "past";
                    } else if (isTodayDate(interviewDate)) {
                      status = "today";
                    } else if (isTomorrowDate(interviewDate)) {
                      status = "tomorrow";
                    } else if (isThisWeekDate(interviewDate)) {
                      status = "thisWeek";
                    }

                    const colors =
                      interviewStatusColors[
                        status as keyof typeof interviewStatusColors
                      ];

                    return (
                      <div
                        key={`calendar-${interview._id || index}`}
                        className={cn(
                          "p-2 rounded shadow-sm",
                          colors.bg,
                          colors.border
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <CalendarIcon
                              className={cn("h-3 w-3 mr-1", colors.icon)}
                            />
                            <span
                              className={cn("text-sm font-medium", colors.text)}
                            >
                              {formatInterviewDate(interview.startTime)}
                            </span>
                          </div>
                          <Badge variant="outline" className={colors.badge}>
                            {getInterviewStatusLabel(status)}
                          </Badge>
                        </div>
                        {interview.description && (
                          <p className="text-xs text-gray-600 mt-1">
                            {interview.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitSchedule}>
              {/* Interviewer Information Section */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Interviewers
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addInterviewer}
                    className="flex items-center"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {interviewerInfo.map((interviewer, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Interviewer name"
                        value={interviewer.name}
                        onChange={(e) =>
                          updateInterviewer(index, "name", e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="email"
                        placeholder="interviewer@email.com"
                        value={interviewer.email}
                        onChange={(e) =>
                          updateInterviewer(index, "email", e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      {interviewerInfo.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeInterviewer(index)}
                          className="px-2"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Calendar
                mode="single"
                selected={formData.date}
                onSelect={(date) => {
                  setFormData({ ...formData, date: date ? date : new Date() });
                }}
                className="rounded-md border"
                disabled={(date) => isPastOrToday(date)}
                modifiers={{
                  scheduled: (date) => isDateScheduled(date),
                  notAvailable: (date) => isPastOrToday(date),
                }}
                modifiersClassNames={{
                  scheduled: "bg-red-100 text-red-800 font-medium line-through",
                  notAvailable: "bg-amber-100 text-amber-800",
                  selected: "bg-primary text-primary-foreground",
                  today:
                    "!bg-gradient-to-br !from-blue-500 !to-purple-600 !text-white !font-bold !text-lg !scale-110 !shadow-lg !border-2 !border-white !ring-2 !ring-blue-300 !ring-offset-1",
                }}
                modifiersStyles={{
                  scheduled: {
                    backgroundColor: "#fecaca",
                    textDecoration: "line-through",
                  },
                  notAvailable: { backgroundColor: "#f3f4f6" },
                  past: { backgroundColor: "#fef3c7" },
                  today: {
                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "1.125rem",
                    transform: "scale(1.1)",
                    boxShadow:
                      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    border: "2px solid white",
                    borderRadius: "6px",
                  },
                }}
              />
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700">
                  Time
                </label>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                >
                  {Array.from({ length: 12 }, (_, i) => i + 9).map((hour) => {
                    const formattedHour = hour > 12 ? hour - 12 : hour;
                    const period = hour >= 12 ? "PM" : "AM";
                    return (
                      <option key={hour} value={`${hour}:00`}>
                        {formattedHour}:00 {period}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={2}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Add details about this interview"
                ></textarea>
              </div>
              <Button type="submit" className="mt-3 w-full cursor-pointer">
                Schedule Interview
              </Button>
            </form>

            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {Object.entries(interviewStatusColors).map(([key, colors]) => (
                <div key={key} className="flex items-center">
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full mr-1",
                      colors.bg,
                      colors.border
                    )}
                  />
                  <span>{getInterviewStatusLabel(key)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
        <Button
          variant={activeView === "email" ? "secondary" : "outline"}
          onClick={handleEmailClick}
          className="flex items-center cursor-pointer"
        >
          <Mail className="h-4 w-4 mr-1" />
          Email
        </Button>
        <Button
          variant={activeView === "calendar" ? "secondary" : "outline"}
          onClick={handleScheduleClick}
          className="flex items-center cursor-pointer"
        >
          <CalendarIcon className="h-4 w-4 mr-1" />
          Schedule
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CandidateCard;
