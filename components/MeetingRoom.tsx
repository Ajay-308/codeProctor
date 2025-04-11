import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "./ui/resizable";
import {
  CallControls,
  CallingState,
  CallParticipantsList,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { Button } from "./ui/button";
import CodeEditor from "./codeditor";
import EndCallButton from "./endCallButton";
