import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useMeetingActions } from "@/hooks/useMeetingActions";
import { toast } from "react-hot-toast";

interface MeetingModelProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (meetingId: string) => void;
  isLoading: boolean;
  title: string;
  isJoinMeeting: boolean;
}

export default function MeetingModel({
  isOpen,
  onClose,
  onSubmit,
  title,
  isJoinMeeting,
}: MeetingModelProps) {
  const [meetingUrl, setMeetingUrl] = useState("");
  const { createInstantMeeting, joinMeeting } = useMeetingActions();

  const handleSubmit = async () => {
    if (isJoinMeeting) {
      const meetingId = meetingUrl.split("/").pop();
      if (!meetingId) {
        toast.error("Invalid meeting URL");
        return;
      }
      await joinMeeting(meetingId);
    } else {
      createInstantMeeting();
    }
    setMeetingUrl("");
    onSubmit(meetingUrl);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
      </DialogContent>
      <div className="flex flex-col gap-4 p-4">
        {isJoinMeeting && (
          <Input
            value={meetingUrl}
            onChange={(e) => setMeetingUrl(e.target.value)}
            placeholder="Enter meeting URL"
          />
        )}
        <div className="flex justify-end p-4">
          <Button variant={"outline"} className="mr-2" onClick={onClose}>
            cancel
          </Button>
          <Button
            variant={"default"}
            onClick={handleSubmit}
            disabled={isJoinMeeting && !meetingUrl.trim()}
          >
            {isJoinMeeting ? "Join" : "Create"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
