"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import useGetCallById from "@/hooks/useGetCallById";
import LoaderUI from "@/components/LoaderUI";
import { StreamCall, StreamTheme } from "@stream-io/video-react-sdk";
import MeetingSetup from "@/components/MeetingSetup";
import MeetingRoom from "@/components/MeetingRoom";

export default function MeetingPage() {
  const { id } = useParams();
  const { isLoaded, user } = useUser();
  const { call, isCallLoading } = useGetCallById(id ?? "");
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  // ✅ Show loader while data is loading
  if (!isLoaded || isCallLoading) return <LoaderUI />;

  // 🛑 Handle missing call
  if (!call) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/80">
        <p className="text-muted-foreground animate-pulse">
          No meeting found with this ID
        </p>
      </div>
    );
  }

  // 🛑 Handle missing user
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/80">
        <p className="text-muted-foreground animate-pulse">
          No user found with this ID
        </p>
      </div>
    );
  }

  // ✅ Render the meeting room
  return (
    <StreamCall call={call}>
      <StreamTheme>
        {!isSetupComplete ? (
          <MeetingSetup onSetupComplete={() => setIsSetupComplete(true)} />
        ) : (
          <MeetingRoom />
        )}
      </StreamTheme>
    </StreamCall>
  );
}
