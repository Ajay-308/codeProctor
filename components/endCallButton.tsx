import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import toast from "react-hot-toast";

export default function EndCallButton() {
  const call = useCall();
  const router = useRouter();
  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();

  const updateInterviewStatus = useMutation(api.interviews.updateInterview);
  const interview = useQuery(api.interviews.getInterviewByStreamId, {
    streamCallId: call?.id ?? "",
  });
  if (!call || !interview) return null;

  // check karna hai ki jo user hai wahi owner hia ki nhi
  const isMeetingOwner = localParticipant?.userId === call?.state.createdBy?.id;
  if (!isMeetingOwner) {
    toast.error("you are not the owner of this meeting");
    return null;
  }

  const handleEndCall = async () => {
    try {
      await call.endCall();
      await updateInterviewStatus({
        id: interview[0]?._id,
        status: "completed",
      });
      toast.success("call ended successfully");
      router.push("/");
    } catch (err) {
      console.error("error while ending call", err);
      toast.error("error while ending call");
    }
  };
  return (
    <Button variant={"destructive"} className="w-full" onClick={handleEndCall}>
      End Call
    </Button>
  );
}
