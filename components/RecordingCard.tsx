"use client";

import type { CallRecording } from "@stream-io/video-react-sdk";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { calculateRecodingDuration } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { CalendarIcon, CopyIcon, PlayIcon, VideoIcon } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

function RecordingCard({ recording }: { recording: CallRecording }) {
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(recording.url);
      toast.success("Recording link copied to clipboard");
    } catch (error) {
      console.error("failed to copy link", error);
      toast.error("Failed to copy link to clipboard");
    }
  };

  const formattedStartTime = recording.start_time
    ? format(new Date(recording.start_time), "MMM d, yyyy, hh:mm a")
    : "Unknown";

  const duration =
    recording.start_time && recording.end_time
      ? calculateRecodingDuration(recording.start_time, recording.end_time)
      : "Unknown duration";

  const recordingId =
    recording.url?.split("/").pop()?.substring(0, 8) || "Recording";

  return (
    <Card className="group overflow-hidden border border-border/40 hover:border-border/80 transition-all duration-300 hover:shadow-lg">
      <CardHeader className="space-y-1 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center bg-primary/10 rounded-full p-1.5">
              <VideoIcon className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-medium text-sm">Recording {recordingId}</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleCopyLink}
          >
            <CopyIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {/* CARD CONTENT */}
      <CardContent className="pb-4">
        <div
          className="relative w-full aspect-video bg-gradient-to-br from-muted/80 to-muted rounded-lg overflow-hidden cursor-pointer group/player"
          onClick={() => window.open(recording.url, "_blank")}
        >
          {/* Thumbnail overlay */}
          <div className="absolute inset-0 bg-black/5 group-hover/player:bg-black/10 transition-colors duration-300" />

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={cn(
                "size-14 rounded-full bg-background/90 flex items-center justify-center",
                "shadow-sm border border-border/50",
                "transform transition-all duration-300",
                "group-hover/player:bg-primary group-hover/player:scale-110 group-hover/player:shadow-md"
              )}
            >
              <PlayIcon className="size-6 text-muted-foreground group-hover/player:text-primary-foreground transition-colors" />
            </div>
          </div>

          {/* Duration badge */}
          <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium">
            {duration}
          </div>
        </div>

        {/* Recording metadata */}
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>{formattedStartTime}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          className="w-full group/btn relative overflow-hidden"
          onClick={() => window.open(recording.url, "_blank")}
        >
          <span className="relative z-10 flex items-center cursor-pointer justify-center gap-2">
            <PlayIcon className="size-4" />
            Play Recording
          </span>
          <span className="absolute inset-0 bg-primary-foreground/10 transform translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default RecordingCard;
