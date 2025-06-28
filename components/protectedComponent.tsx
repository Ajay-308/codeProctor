"use client";

import type React from "react";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useUserRole from "@/hooks/useUserRole";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/unauthorized",
}: ProtectedRouteProps) {
  const { isLoaded, user } = useUser();
  const { isInterviewer, isCandidate } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      const userRole = isInterviewer
        ? "interviewer"
        : isCandidate
          ? "candidate"
          : null;

      if (userRole && !allowedRoles.includes(userRole)) {
        router.push(redirectTo);
      }
    }
  }, [
    isLoaded,
    user,
    isInterviewer,
    isCandidate,
    allowedRoles,
    redirectTo,
    router,
  ]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  const userRole = isInterviewer
    ? "interviewer"
    : isCandidate
      ? "candidate"
      : null;
  if (userRole && !allowedRoles.includes(userRole)) {
    return null;
  }

  return <>{children}</>;
}
