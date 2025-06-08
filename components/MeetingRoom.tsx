"use client";

import {
  CallingState,
  CallParticipantsList,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { CustomSpeakerLayout } from "./CustomSpeakerLayout";
import { CustomGridLayout } from "./customeGridLayout";
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
import { FloatingReactions } from "./FlootingReaction";

// Reaction interface
interface CustomEventPayload {
  type: "custom";
  custom?: {
    type?: string;
    emoji?: string;
    userId?: string;
    userName?: string;
    timestamp?: number;
  };
}
interface EmojiReaction {
  id: string;
  emoji: string;
  userId: string;
  userName: string;
  timestamp: number;
}

function MeetingRoom() {
  const router = useRouter();
  const [layout, setLayout] = useState<"grid" | "speaker">("grid");
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState, useLocalParticipant } = useCallStateHooks();
  const callingState = useCallCallingState();
  const localParticipant = useLocalParticipant();
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [reactions, setReactions] = useState<EmojiReaction[]>([]);

  const call = useCall();

  useEffect(() => {
    if (!call) return;

    const handleCustomEvent = (event: CustomEventPayload) => {
      console.log("Received custom event:", event);

      if (
        event.custom &&
        typeof event.custom === "object" &&
        event.custom.type === "emoji_reaction"
      ) {
        const reactionData = event.custom as {
          emoji?: string;
          userId?: string;
          userName?: string;
        };
        const newReaction: EmojiReaction = {
          id: `${reactionData.userId}-${Date.now()}-${Math.random()}`,
          emoji: reactionData.emoji ?? "",
          userId: reactionData.userId ?? "",
          userName: reactionData.userName ?? "",
          timestamp: Date.now(),
        };

        console.log("Adding new reaction:", newReaction);
        setReactions((prev) => [...prev, newReaction]);

        setTimeout(() => {
          setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
        }, 6000);
      }
    };

    call.on("custom", handleCustomEvent);

    return () => {
      call.off("custom", handleCustomEvent);
    };
  }, [call]);

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

  const toggleCamera = () => {
    if (!call) return;

    if (isCameraOff) {
      call.camera.enable();
    } else {
      call.camera.disable();
    }
    setIsCameraOff(!isCameraOff);
  };

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

  useEffect(() => {
    if (call) {
      setIsMicMuted(!call.microphone.enabled);
      setIsCameraOff(!call.camera.enabled);
      setIsScreenSharing(call.screenShare.enabled);
    }
  }, [call]);

  const emojis = ["👍", "👏", "❤️", "🎉", "🔥", "😂", "😮", "🤔"];

  const sendReaction = async (emoji: string) => {
    if (!call || !localParticipant) return;

    try {
      console.log("Sending reaction:", emoji);

      await call.sendCustomEvent({
        type: "emoji_reaction",
        emoji: emoji,
        userId: localParticipant.userId,
        userName: localParticipant.name || localParticipant.userId,
        timestamp: Date.now(),
      });

      console.log("Reaction sent successfully");
      setShowEmoji(false);
      toast.success(`Sent ${emoji} reaction!`);
    } catch (error) {
      console.error("Error sending reaction:", error);
      toast.error("Failed to send reaction");
    }
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
                <CustomGridLayout reactions={reactions} />
              ) : (
                <CustomSpeakerLayout reactions={reactions} />
              )}

              <div className="absolute inset-0 pointer-events-none z-30">
                <FloatingReactions reactions={reactions} />
              </div>
            </div>

            <AnimatePresence>
              {showParticipants && (
                <motion.div
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 300, opacity: 0 }}
                  transition={{ type: "spring", damping: 20 }}
                  className="absolute right-0 top-0 h-full w-[300px] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-l border-border/50 shadow-lg z-20"
                >
                  <CallParticipantsList
                    onClose={() => setShowParticipants(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <AnimatePresence>
            {showEmoji && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: -80, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md rounded-full p-3 shadow-xl z-30"
              >
                <div className="flex gap-3">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => sendReaction(emoji)}
                      className="text-2xl hover:scale-125 transition-transform p-2 rounded-full hover:bg-slate-800/50"
                      title={`Send ${emoji} reaction`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="flex items-center gap-2 p-2 rounded-full bg-slate-900/90 backdrop-blur-md shadow-xl">
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
