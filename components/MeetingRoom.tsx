import {
  CallControls,
  CallingState,
  CallParticipantsList,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { LayoutListIcon, LoaderIcon, UsersIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import EndCallButton from "./endCallButton";
import CodeEditor from "./codeditor";
import { motion, AnimatePresence } from "framer-motion";

function MeetingRoom() {
  const router = useRouter();
  const [layout, setLayout] = useState<"grid" | "speaker">("speaker");
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

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
              {layout === "grid" ? <PaginatedGridLayout /> : <SpeakerLayout />}
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

          {/* VIDEO CONTROLS */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-4 -margin-2  left-0 right-0"
          >
            <div className="w-full max-w-md flex flex-col items-center  px-4">
              {/* Top Controls Container */}
              <div className="w-full flex flex-wrap items-center justify-center h-32 shadow-xl rounded-xl bg-slate-900/80 backdrop-blur-md">
                <CallControls onLeave={() => router.push("/")} />
                <div className="w-px h-4 bg-slate-700/50 " />

                {/* Layout Toggle Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-lg hover:bg-slate-800/80 hover:text-blue-400 transition-all duration-200"
                    >
                      <LayoutListIcon className="size-4 " />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="center"
                    className="bg-slate-900 border border-slate-800 shadow-md rounded-md"
                  >
                    <DropdownMenuItem
                      onClick={() => setLayout("grid")}
                      className="hover:bg-slate-800 rounded mt-8"
                    >
                      Grid View
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setLayout("speaker")}
                      className="hover:bg-slate-800 rounded"
                    >
                      Speaker View
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Participants Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-lg transition-all duration-200 ${
                    showParticipants
                      ? "bg-blue-500/20 text-blue-400"
                      : "hover:bg-slate-800/80 hover:text-blue-400"
                  }`}
                  onClick={() => setShowParticipants(!showParticipants)}
                >
                  <UsersIcon className="size-4" />
                </Button>

                {/* End Call Button */}
                <EndCallButton />
              </div>
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
