"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import useGetCallById from "@/hooks/useGetCallById";
import LoaderUI from "@/components/LoaderUI";
import { StreamCall, StreamTheme } from "@stream-io/video-react-sdk";
import MeetingSetup from "@/components/MeetingSetup";
import MeetingRoom from "@/components/MeetingRoom";

export default function InterviewRoomPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const { isLoaded, user } = useUser();
  const { call, isCallLoading } = useGetCallById(id ?? "");
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  if (!isLoaded || isCallLoading) return <LoaderUI />;

  if (!call) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/80">
        <div className="text-center space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm max-w-md mx-auto">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Interview Room Not Found
            </h1>
            <p className="text-gray-600 text-sm mb-4">
              No interview room found with this ID. The interview may have ended
              or the link may be invalid.
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🛑 Handle missing user
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/80">
        <div className="text-center space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm max-w-md mx-auto">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Required
            </h1>
            <p className="text-gray-600 text-sm mb-4">
              Please sign in to join the interview room.
            </p>
            <button
              onClick={() => (window.location.href = "/sign-in")}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Render the interview room
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
