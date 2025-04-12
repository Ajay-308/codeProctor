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
import EndCallButton from "./EndCallButton";
import CodeEditor from "./CodeEditor";
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
            className="absolute bottom-4 left-0 right-0"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 flex-wrap justify-center px-4">
                <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 rounded-full border border-border/50 shadow-lg">
                  <div className="flex items-center gap-2">
                    <CallControls onLeave={() => router.push("/")} />

                    <div className="flex items-center gap-2 ml-2 border-l border-border/50 pl-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-10 hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <LayoutListIcon className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setLayout("grid")}>
                            Grid View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setLayout("speaker")}
                          >
                            Speaker View
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button
                        variant="outline"
                        size="icon"
                        className={`size-10 transition-colors ${
                          showParticipants
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-primary hover:text-primary-foreground"
                        }`}
                        onClick={() => setShowParticipants(!showParticipants)}
                      >
                        <UsersIcon className="size-4" />
                      </Button>

                      <EndCallButton />
                    </div>
                  </div>
                </div>
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
