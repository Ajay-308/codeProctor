"use client";
import { useEffect } from "react";

import LoaderUI from "@/components/LoaderUI";
import useUserRole from "@/hooks/useUserRole";
import { useRouter } from "next/navigation";
import InterviewScheduleUI from "./interviewScheduleUI";
import Navbar from "@/components/Navbar";

function SchedulePage() {
  const router = useRouter();

  const { isInterviewer, isLoading } = useUserRole();

  useEffect(() => {
    if (!isLoading && !isInterviewer) {
      router.push("/");
    }
  }, [isLoading, isInterviewer, router]);

  if (isLoading) return <LoaderUI />;

  return (
    <>
      <Navbar />
      <InterviewScheduleUI />;
    </>
  );
}
export default SchedulePage;
