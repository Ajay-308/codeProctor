"use client";

import {
  CallingState,
  CallParticipantsList,
  useCall,
  useCallStateHooks,
  ParticipantView,
  StreamVideoParticipant,
} from "@stream-io/video-react-sdk";
import {
  LayoutListIcon,
  LoaderIcon,
  UsersIcon,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share2,
  Monitor,
  SmileIcon,
  PhoneOff,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import CodeEditor from "./codeditor";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import toast from "react-hot-toast";

// Custom Participant Tile Component
const ParticipantTile = ({
  participant,
  isLocal = false,
}: {
  participant: StreamVideoParticipant;
  isLocal?: boolean;
}) => {
  const [isSpeaking] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        "relative bg-white rounded-xl overflow-hidden border-2 transition-all duration-200 min-h-0",
        isSpeaking
          ? "border-green-400 shadow-lg shadow-green-400/20"
          : "border-slate-700/50",
        "hover:border-slate-500/70 shadow-lg"
      )}
    >
      <div className="w-full h-full object-contain">
        <ParticipantView participant={participant} className="w-full h-full" />
        <style jsx>{`
          :global(.str-video__participant-view video) {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            object-position: center center !important;
          }
        `}</style>

        {/* Participant Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-white text-sm font-medium truncate">
                {participant.name || participant.userId}
                {isLocal && " (You)"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {participant.audioStream && (
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    isSpeaking ? "bg-red-600 animate-pulse" : "bg-gray-500"
                  )}
                />
              )}
              {participant.videoStream && (
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    participant.videoDimension?.width &&
                      participant.videoDimension?.height
                      ? "bg-blue-400 animate-pulse"
                      : "bg-gray-500"
                  )}
                />
              )}
            </div>
          </div>
        </div>

        {/* Speaking Indicator */}
        {isSpeaking && (
          <div className="absolute top-3 right-3">
            <div className="bg-green-500 rounded-full p-1.5 animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </div>
        )}

        {/* Connection Status */}
        <div className="absolute top-3 left-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Custom Grid Layout Component
const CustomGridLayout = () => {
  const { useParticipants, useLocalParticipant } = useCallStateHooks();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();

  const totalParticipants = participants.length;

  // Calculate optimal grid layout
  const getGridLayout = (count: number) => {
    if (count === 1) return { cols: 1, rows: 1, maxWidth: "60%" };
    if (count === 2) return { cols: 1, rows: 2, maxWidth: "80%" };
    if (count <= 4) return { cols: 2, rows: 2, maxWidth: "100%" };
    if (count <= 6) return { cols: 3, rows: 2, maxWidth: "100%" };
    if (count <= 9) return { cols: 3, rows: 3, maxWidth: "100%" };
    if (count <= 12) return { cols: 4, rows: 3, maxWidth: "100%" };
    return { cols: 4, rows: 4, maxWidth: "100%" };
  };

  const layout = getGridLayout(totalParticipants);

  return (
    <div className="h-full flex items-center justify-center p-6 bg-slate-950">
      <div
        className="w-full h-full max-w-7xl"
        style={{ maxWidth: layout.maxWidth }}
      >
        <div
          className="grid gap-4 h-full w-full"
          style={{
            gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
            gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
            aspectRatio: totalParticipants === 1 ? "16/9" : "auto",
          }}
        >
          <AnimatePresence>
            {/* Local Participant First */}
            {localParticipant && (
              <ParticipantTile
                key={localParticipant.sessionId}
                participant={localParticipant}
                isLocal={true}
              />
            )}

            {/* Remote Participants */}
            {participants
              .filter((p) => p.sessionId !== localParticipant?.sessionId)
              .map((participant) => (
                <ParticipantTile
                  key={participant.sessionId}
                  participant={participant}
                />
              ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// Speaker Layout with Thumbnails
const CustomSpeakerLayout = () => {
  const { useParticipants, useLocalParticipant, useDominantSpeaker } =
    useCallStateHooks();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();
  const dominantSpeaker = useDominantSpeaker();

  // Main speaker is either dominant speaker or local participant
  const mainSpeaker = dominantSpeaker || localParticipant;
  const otherParticipants = participants.filter(
    (p) => p.sessionId !== mainSpeaker?.sessionId
  );

  return (
    <div className="h-full bg-white relative flex flex-col">
      {/* Main Speaker */}
      {mainSpeaker && (
        <div className="flex-1 p-6">
          <div className="h-full max-w-5xl mx-auto">
            <ParticipantTile
              participant={mainSpeaker}
              isLocal={mainSpeaker.sessionId === localParticipant?.sessionId}
            />
          </div>
        </div>
      )}

      {/* Thumbnail Strip */}
      {otherParticipants.length > 0 && (
        <div className="p-4 border-t border-slate-800/50">
          <div className="flex gap-3 justify-center flex-wrap max-w-6xl mx-auto">
            {otherParticipants.slice(0, 8).map((participant) => (
              <div
                key={participant.sessionId}
                className="w-32 h-48 flex-shrink-0"
              >
                <ParticipantTile
                  participant={participant}
                  isLocal={
                    participant.sessionId === localParticipant?.sessionId
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function MeetingRoom() {
  const router = useRouter();
  const [layout, setLayout] = useState<"grid" | "speaker">("grid");
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  // Add state for media controls
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const call = useCall();

  // Handle mic toggle
  const toggleMic = () => {
    if (!call) return;

    if (isMicMuted) {
      call.microphone.enable();
    } else {
      call.microphone.disable();
    }
    setIsMicMuted(!isMicMuted);
  };

  const toggleRecording = async () => {
    if (!call) {
      toast.error("Call not initialized");
      return;
    }

    try {
      if (isRecording) {
        await call.stopRecording();
        toast.success("Recording stopped");
        setIsRecording(false);
      } else {
        await call.startRecording();
        toast.success("Recording started");
        setIsRecording(true);
      }
    } catch (err: unknown) {
      console.error("Recording error:", err);
      if (
        err instanceof Error &&
        (err.message?.includes("already being recorded") ||
          (err as { error?: { message?: string } })?.error?.message?.includes(
            "already being recorded"
          ))
      ) {
        toast.custom("Call is already being recorded");
        setIsRecording(true);
      } else {
        if (err instanceof Error) {
          toast.error(err.message || "Failed to toggle recording");
        } else {
          toast.error("Failed to toggle recording");
        }
      }
    }
  };

  useEffect(() => {
    const syncRecordingState = async () => {
      if (call) {
        try {
          const recordings = await call.queryRecordings();
          console.log("Recordings data structure:", recordings);

          const isActiveRecording =
            recordings &&
            recordings.recordings &&
            recordings.recordings.length > 0;

          setIsRecording(isActiveRecording);
        } catch (error) {
          console.error("Error fetching recording state:", error);
        }
      }
    };

    syncRecordingState();
  }, [call]);

  // Handle camera toggle
  const toggleCamera = () => {
    if (!call) return;

    if (isCameraOff) {
      call.camera.enable();
    } else {
      call.camera.disable();
    }
    setIsCameraOff(!isCameraOff);
  };

  // Handle screen sharing
  const toggleScreenShare = async () => {
    if (!call) return;

    try {
      if (isScreenSharing) {
        await call.screenShare.disable();
      } else {
        await call.screenShare.enable();
      }
      setIsScreenSharing(!isScreenSharing);
    } catch (error) {
      console.error("Error toggling screen share:", error);
    }
  };

  // Handle end call
  const endCall = async () => {
    if (!call) return;

    try {
      await call.leave();
      router.push("/");
    } catch (error) {
      console.error("Error ending call:", error);
      router.push("/");
    }
  };

  // Sync state with call object on mount
  useEffect(() => {
    if (call) {
      setIsMicMuted(!call.microphone.enabled);
      setIsCameraOff(!call.camera.enabled);
      setIsScreenSharing(call.screenShare.enabled);
    }
  }, [call]);

  // Emoji reactions
  const emojis = ["👍", "👏", "❤️", "🎉", "🔥", "😂", "😮", "🤔"];

  const sendReaction = (emoji: string) => {
    console.log(`Sending reaction: ${emoji}`);
    setShowEmoji(false);
  };

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="h-96 flex items-center justify-center bg-gradient-to-br from-background to-background/80">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <LoaderIcon className="size-8 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">
            Joining meeting...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem-1px)] bg-gradient-to-br from-background to-background/80">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={35}
          minSize={25}
          maxSize={100}
          className="relative"
        >
          {/* VIDEO LAYOUT */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0"
          >
            <div className="relative h-full rounded-lg overflow-hidden border border-border/50 shadow-lg">
              {layout === "grid" ? (
                <CustomGridLayout />
              ) : (
                <CustomSpeakerLayout />
              )}
            </div>

            {/* PARTICIPANTS LIST OVERLAY */}
            <AnimatePresence>
              {showParticipants && (
                <motion.div
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 300, opacity: 0 }}
                  transition={{ type: "spring", damping: 20 }}
                  className="absolute right-0 top-0 h-full w-[300px] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-l border-border/50 shadow-lg"
                >
                  <CallParticipantsList
                    onClose={() => setShowParticipants(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* EMOJI REACTIONS PANEL */}
          <AnimatePresence>
            {showEmoji && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: -80, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md rounded-full p-2 shadow-xl"
              >
                <div className="flex gap-2">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => sendReaction(emoji)}
                      className="text-xl hover:scale-125 transition-transform p-1"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CUSTOM VIDEO CONTROLS */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2"
          >
            <div className="flex items-center gap-2 p-2 rounded-full bg-slate-900/90 backdrop-blur-md shadow-xl">
              {/* Mic Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "rounded-full w-12 h-12",
                        isMicMuted
                          ? "bg-red-500/90 hover:bg-red-600/90 text-white"
                          : "hover:bg-slate-800"
                      )}
                      onClick={toggleMic}
                    >
                      {isMicMuted ? (
                        <MicOff className="h-5 w-5" />
                      ) : (
                        <Mic className="h-5 w-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {isMicMuted ? "Unmute microphone" : "Mute microphone"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Camera Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "rounded-full w-12 h-12",
                        isCameraOff
                          ? "bg-red-500/90 hover:bg-red-600/90 text-white"
                          : "hover:bg-slate-800"
                      )}
                      onClick={toggleCamera}
                    >
                      {isCameraOff ? (
                        <VideoOff className="h-5 w-5" />
                      ) : (
                        <Video className="h-5 w-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {isCameraOff ? "Turn camera on" : "Turn camera off"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Reactions Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "rounded-full w-12 h-12",
                        showEmoji
                          ? "bg-slate-800 hover:bg-slate-700"
                          : "hover:bg-slate-800"
                      )}
                      onClick={() => setShowEmoji(!showEmoji)}
                    >
                      <SmileIcon className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Reactions</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Screen Share Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "rounded-full w-12 h-12",
                        isScreenSharing
                          ? "bg-green-500/90 hover:bg-green-600/90 text-white"
                          : "hover:bg-slate-800"
                      )}
                      onClick={toggleScreenShare}
                    >
                      {isScreenSharing ? (
                        <Monitor className="h-5 w-5" />
                      ) : (
                        <Share2 className="h-5 w-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {isScreenSharing ? "Stop sharing" : "Share screen"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Record Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full w-12 h-12 hover:bg-slate-800"
                      onClick={toggleRecording}
                    >
                      <div className="relative">
                        {isRecording && (
                          <div className="h-3 w-3 rounded-full absolute -top-1 -right-1 bg-red-500 animate-pulse" />
                        )}
                        <Video className="h-5 w-5" />
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {isRecording ? "Stop recording" : "Start recording"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* End Call Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="rounded-full w-12 h-12 bg-red-600 hover:bg-red-700"
                      onClick={endCall}
                    >
                      <PhoneOff className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">End call</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Layout Toggle */}
              <div className="ml-2 pl-2 border-l border-slate-700">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full w-10 h-10 hover:bg-slate-800"
                          >
                            <LayoutListIcon className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="center"
                          className="bg-slate-900 border border-slate-800 shadow-md rounded-md"
                        >
                          <DropdownMenuItem
                            onClick={() => setLayout("grid")}
                            className="hover:bg-slate-800 rounded text-white"
                          >
                            Grid View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setLayout("speaker")}
                            className="hover:bg-slate-800 rounded text-white"
                          >
                            Speaker View
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TooltipTrigger>
                    <TooltipContent side="top">Change layout</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Participants Toggle */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "rounded-full w-10 h-10",
                        showParticipants
                          ? "bg-slate-800 hover:bg-slate-700"
                          : "hover:bg-slate-800"
                      )}
                      onClick={() => setShowParticipants(!showParticipants)}
                    >
                      <UsersIcon className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Participants</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </motion.div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={65} minSize={25}>
          <CodeEditor />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default MeetingRoom;
