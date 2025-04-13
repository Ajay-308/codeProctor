import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  addHours,
  intervalToDuration,
  isAfter,
  isBefore,
  isWithinInterval,
} from "date-fns";
import { Doc } from "@/convex/_generated/dataModel";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Interview = Doc<"interviews"> & {
  status:
    | "scheduled"
    | "cancelled"
    | "completed"
    | "failed"
    | "succeeded"
    | "live"
    | "upcoming"
    | string;
};
type User = Doc<"users">;

export const getCandiateInfo = (users: User[], candidateId: string) => {
  const candidate = users.find((user) => user.clerkId === candidateId);
  if (!candidate) return null;
  return {
    name: candidate.name,
    image: candidate.image,
    initials:
      candidate.name
        .split(" ")
        .map((n) => n[0])
        .join("") || "Uc",
  };
};

export const getInterviewerInfo = (users: User[], interviewerId: string) => {
  const interviewer = users?.find((user) => user.clerkId === interviewerId);
  return {
    name: interviewer?.name || "Unknown Interviewer",
    image: interviewer?.image,
    initials:
      interviewer?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("") || "UI",
  };
};

export const getMeetingStatus = (interview: Interview) => {
  const now = new Date();
  const startTime = new Date(interview.startTime);
  const endTime = addHours(startTime, 1);
  const isLive = isWithinInterval(now, { start: startTime, end: endTime });

  if (["completed", "failed", "succeeded"].includes(interview.status)) {
    return "completed";
  }
  if (isLive) return "live";
  if (isBefore(now, startTime)) return "upcoming";
  return "competed";
};

export const calculateRecodingDuration = (
  startTime: string,
  endTime: string
) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const duration = intervalToDuration({ start, end });
  if (duration.hours && duration.hours > 0) {
    return `${duration.hours}:${String(duration.minutes).padStart(2, "0")}:${String(
      duration.seconds
    ).padStart(2, "0")}`;
  }

  if (duration.minutes && duration.minutes > 0) {
    return `${duration.minutes}:${String(duration.seconds).padStart(2, "0")}`;
  }

  return `${duration.seconds} seconds`;
};

export const groupInterviews = (interview: Interview[]) => {
  if (!interview || interview.length === 0) return [];

  return interview.reduce((acc: { [key: string]: Interview[] }, interview) => {
    const date = new Date(interview.startTime).toLocaleDateString();
    const now = new Date();

    if (interview.status === "succeeded") {
      acc.Succeeded = [...(acc.succeeded || []), interview];
    } else if (interview.status === "failed") {
      acc.failed = [...(acc.failed || []), interview];
    } else if (isBefore(date, now)) {
      acc.completed = [...(acc.completed || []), interview];
    } else if (isAfter(date, now)) {
      acc.upcoming = [...(acc.upcoming || []), interview];
    }
    return acc;
  }, {});
};
