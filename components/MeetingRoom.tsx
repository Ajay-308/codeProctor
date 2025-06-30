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
  X,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
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
import { useMediaQuery } from "@/hooks/useMediaQuery";

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
  const params = useParams();
  const [layout, setLayout] = useState<"grid" | "speaker">("grid");
  const [showParticipants, setShowParticipants] = useState(false);
  const [, setShowCodeEditor] = useState(true);
  const [mobileView, setMobileView] = useState<"video" | "code">("video");

  // Media queries for responsive design
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

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
  const roomId = (params?.id as string) || (params?.roomId as string);
  const streamRoomId = call?.id;
  const streamUserId = localParticipant?.userId;
  const streamUserName = localParticipant?.name || localParticipant?.userId;

  const finalRoomId = streamRoomId || roomId || "default-room";
  const finalUserId = streamUserId || "anonymous-user";
  const finalUserName = streamUserName || "Anonymous";

  // Set mobile view to video by default on mobile devices
  useEffect(() => {
    if (isMobile) {
      setMobileView("video");
      setShowCodeEditor(false);
    } else {
      setShowCodeEditor(true);
    }
  }, [isMobile]);

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
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/80">
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

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="h-screen bg-gradient-to-br from-background to-background/80 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-3 bg-background/90 backdrop-blur border-b border-border/20 shrink-0">
          <div className="flex gap-1">
            <Button
              variant={mobileView === "video" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMobileView("video")}
              className="text-sm px-4 py-2 h-9 rounded-full"
            >
              Video
            </Button>
            <Button
              variant={mobileView === "code" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMobileView("code")}
              className="text-sm px-4 py-2 h-9 rounded-full"
            >
              Code
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowParticipants(!showParticipants)}
            className="h-9 w-9 p-0 rounded-full"
          >
            <UsersIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {mobileView === "video" ? (
              <motion.div
                key="video"
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="absolute inset-0 p-2"
              >
                <div className="h-full rounded-xl overflow-hidden bg-black/5 border border-border/20">
                  {layout === "grid" ? (
                    <CustomGridLayout reactions={reactions} />
                  ) : (
                    <CustomSpeakerLayout reactions={reactions} />
                  )}
                  <div className="absolute inset-0 pointer-events-none z-30">
                    <FloatingReactions reactions={reactions} />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="code"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="absolute inset-0"
              >
                {/* Mobile Code Editor Container with proper overflow handling */}
                <div className="h-full w-full overflow-hidden bg-background">
                  {finalRoomId && finalUserId ? (
                    <div className="h-full w-full relative">
                      {/* Mobile-optimized wrapper for CodeEditor */}
                      <div className="absolute inset-0 overflow-auto">
                        <div className="min-h-full w-full">
                          <div className="mobile-code-editor-wrapper">
                            <CodeEditor
                              roomId={finalRoomId}
                              userId={finalUserId}
                              userName={finalUserName}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full p-4">
                      <div className="text-center">
                        <LoaderIcon className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                        <p className="text-sm text-muted-foreground">
                          Loading code editor...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Participants Overlay */}
          <AnimatePresence>
            {showParticipants && (
              <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="absolute inset-0 bg-background/98 backdrop-blur-sm z-50 flex flex-col"
              >
                <div className="flex items-center justify-between p-4 border-b border-border/20 shrink-0">
                  <h3 className="font-semibold text-lg">Participants</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowParticipants(false)}
                    className="h-9 w-9 p-0 rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <CallParticipantsList
                    onClose={() => setShowParticipants(false)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Emoji Panel */}
          <AnimatePresence>
            {showEmoji && (
              <motion.div
                initial={{ y: 20, opacity: 0, scale: 0.9 }}
                animate={{ y: -90, opacity: 1, scale: 1 }}
                exit={{ y: 20, opacity: 0, scale: 0.9 }}
                className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl z-40 max-w-[85vw]"
              >
                <div className="grid grid-cols-4 gap-3">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => sendReaction(emoji)}
                      className="text-3xl hover:scale-110 active:scale-95 transition-all duration-200 p-3 rounded-xl hover:bg-slate-800/50 touch-manipulation"
                      title={`Send ${emoji} reaction`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Controls */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-background/95 backdrop-blur-sm border-t border-border/20 shrink-0 safe-area-inset-bottom"
        >
          <div className="flex items-center justify-center gap-3 max-w-sm mx-auto">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-full w-14 h-14 touch-manipulation shadow-lg",
                isMicMuted
                  ? "bg-red-500/90 hover:bg-red-600/90 text-white shadow-red-500/25"
                  : "bg-slate-800/80 hover:bg-slate-700/80 text-white shadow-slate-800/25"
              )}
              onClick={toggleMic}
            >
              {isMicMuted ? (
                <MicOff className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-full w-14 h-14 touch-manipulation shadow-lg",
                isCameraOff
                  ? "bg-red-500/90 hover:bg-red-600/90 text-white shadow-red-500/25"
                  : "bg-slate-800/80 hover:bg-slate-700/80 text-white shadow-slate-800/25"
              )}
              onClick={toggleCamera}
            >
              {isCameraOff ? (
                <VideoOff className="h-6 w-6" />
              ) : (
                <Video className="h-6 w-6" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-full w-14 h-14 touch-manipulation shadow-lg",
                showEmoji
                  ? "bg-blue-500/90 hover:bg-blue-600/90 text-white shadow-blue-500/25"
                  : "bg-slate-800/80 hover:bg-slate-700/80 text-white shadow-slate-800/25"
              )}
              onClick={() => setShowEmoji(!showEmoji)}
            >
              <SmileIcon className="h-6 w-6" />
            </Button>

            <Button
              variant="destructive"
              size="icon"
              className="rounded-full w-14 h-14 bg-red-600/90 hover:bg-red-700/90 touch-manipulation shadow-lg shadow-red-600/25"
              onClick={endCall}
            >
              <PhoneOff className="h-6 w-6" />
            </Button>

            {/* More options for mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-12 h-12 bg-slate-800/80 hover:bg-slate-700/80 text-white touch-manipulation shadow-lg shadow-slate-800/25"
                >
                  <LayoutListIcon className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 shadow-xl rounded-xl mb-4 min-w-[180px]"
              >
                <DropdownMenuItem
                  onClick={() => setLayout("grid")}
                  className="hover:bg-slate-800/80 rounded-lg text-white py-3 px-4 text-base"
                >
                  Grid View
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLayout("speaker")}
                  className="hover:bg-slate-800/80 rounded-lg text-white py-3 px-4 text-base"
                >
                  Speaker View
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={toggleScreenShare}
                  className="hover:bg-slate-800/80 rounded-lg text-white py-3 px-4 text-base"
                >
                  {isScreenSharing ? "Stop Sharing" : "Share Screen"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={toggleRecording}
                  className="hover:bg-slate-800/80 rounded-lg text-white py-3 px-4 text-base"
                >
                  {isRecording ? "Stop Recording" : "Start Recording"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>
      </div>
    );
  }

  // Desktop/Tablet Layout
  return (
    <div className="h-[calc(100vh-4rem-1px)] bg-gradient-to-br from-background to-background/80">
      <ResizablePanelGroup direction={isTablet ? "vertical" : "horizontal"}>
        <ResizablePanel
          defaultSize={isTablet ? 50 : 35}
          minSize={isTablet ? 30 : 25}
          maxSize={isTablet ? 70 : 100}
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

            {/* Desktop Participants Panel */}
            <AnimatePresence>
              {showParticipants && !isTablet && (
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

            {/* Tablet Participants Overlay */}
            <AnimatePresence>
              {showParticipants && isTablet && (
                <motion.div
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "100%", opacity: 0 }}
                  transition={{ type: "spring", damping: 20 }}
                  className="absolute inset-0 bg-background/95 backdrop-blur z-40"
                >
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">Participants</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowParticipants(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <CallParticipantsList
                    onClose={() => setShowParticipants(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Desktop Emoji Panel */}
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

          {/* Desktop Controls */}
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

        <ResizablePanel
          defaultSize={isTablet ? 50 : 65}
          minSize={isTablet ? 30 : 25}
        >
          {finalRoomId && finalUserId ? (
            <CodeEditor
              roomId={finalRoomId}
              userId={finalUserId}
              userName={finalUserName}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading code editor...</p>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default MeetingRoom;
