import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Button } from "./ui/button";
import toast from "react-hot-toast";

function EndCallButton() {
  const call = useCall();
  const router = useRouter();
  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();

  const updateInterviewStatus = useMutation(api.interviews.updateInterview);

  // Extract the UUID part from the CID to try both options
  const callUuid = call?.id || "";
  const callCid = call?.cid || "";
  const callIdPart = callCid.includes(":") ? callCid.split(":")[1] : callCid;

  // Try both ID formats
  const interviewByFullCid = useQuery(api.interviews.getInterviewByStreamId, {
    streamCallId: callCid,
  });

  const interviewByIdPart = useQuery(api.interviews.getInterviewByStreamId, {
    streamCallId: callIdPart,
  });

  const interviewByUuid = useQuery(api.interviews.getInterviewByStreamId, {
    streamCallId: callUuid,
  });

  // Use the first non-null result
  const interview = interviewByFullCid || interviewByIdPart || interviewByUuid;
  if (!call) return null;

  if (!interview || !interview._id) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground animate-pulse">
          No interview found with this ID
        </p>
      </div>
    );
  }

  const isMeetingOwner = localParticipant?.userId === call.state.createdBy?.id;

  if (!isMeetingOwner) return null;

  const endCall = async () => {
    try {
      await call.endCall();

      await updateInterviewStatus({
        id: interview._id,
        status: "completed",
      });
      toast.success("Meeting ended for everyone");
      setTimeout(() => {
        toast.success("Redirecting to dashboard...");
      }, 2000);
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (error) {
      console.error("Error ending call:", error);
      toast.error("Failed to end meeting");
    }
  };

  return (
    <Button
      variant="destructive"
      onClick={endCall}
      className="w-full -mt-[4rem]"
    >
      End Call
    </Button>
  );
}

export default EndCallButton;
