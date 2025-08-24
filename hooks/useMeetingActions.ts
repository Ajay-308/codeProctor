"use client";
import { useRouter } from "next/navigation";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import toast from "react-hot-toast";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
export const useMeetingActions = () => {
  const router = useRouter();
  const streamClient = useStreamVideoClient();
  const { userId } = useAuth();
  const currentUserId = userId ?? "";
  const createInterviewMutation = useMutation(
    api.action.interview.createInterviewWithUUID
  );
  const createInstantMeeting = async () => {
    if (!streamClient) {
      toast.error("stream client not found");
      return;
    }

    try {
      const id = crypto.randomUUID();
      const call = streamClient.call("default", id);
      await call.getOrCreate({
        data: {
          starts_at: new Date().toISOString(),
          custom: {
            Description: "instant meeting",
          },
        },
      });

      await createInterviewMutation({
        title: "Instant Meeting",
        description: "Created on the fly",
        startTime: Date.now(),
        status: "in-progress",
        streamCallId: id,
        candidateId: currentUserId,
        interviewerIds: [currentUserId],
      });
      router.push(`/meeting/${id}`);
      toast.success("meeting created successfully");
    } catch (e) {
      console.log("error while creating instant meeting", e);
      toast.error("error while creating instant meeting");
    }
  };

  const joinMeeting = async (callId: string) => {
    if (!streamClient) {
      toast.error("stream client not found");
      return;
    }

    router.push(`/meeting/${callId}`);
  };
  return {
    createInstantMeeting,
    joinMeeting,
  };
};
