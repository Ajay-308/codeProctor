"use client";
import { useRouter } from "next/navigation";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import toast from "react-hot-toast";

export const useMeetingActions = () => {
  const router = useRouter();
  const streamClient = useStreamVideoClient();
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
      router.push(`/meeting/${id}`);
      toast.success("meeting created successfully");
    } catch (e) {
      console.log("error while creating instant meeting", e);
      toast.error("error while crearting instant meeting");
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
