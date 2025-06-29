"use client";

import { useState } from "react";
import {
  ParticipantView,
  StreamVideoParticipant,
} from "@stream-io/video-react-sdk";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const ParticipantTile = ({
  participant,
  isLocal = false,
}: {
  participant: StreamVideoParticipant;
  isLocal?: boolean;
}) => {
  const [isSpeaking] = useState(false); // You can replace with real-time speaking logic

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "relative rounded-xl overflow-hidden border-2 transition-all duration-200",
        isSpeaking
          ? "border-green-400 shadow-lg shadow-green-400/20"
          : "border-slate-700/50",
        "hover:border-slate-500/70 shadow-lg aspect-[3/4] bg-black"
      )}
    >
      <div className="absolute inset-0 w-full h-full">
        <ParticipantView participant={participant} className="w-full h-full" />

        {/* Force Stream video to fill entire tile */}
        <style jsx>{`
          :global(.str-video__participant-view video) {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            object-position: center center !important;
          }
        `}</style>

        {/* Bottom Info Overlay */}
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

        {/* Top-left status */}
        <div className="absolute top-3 left-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
};
