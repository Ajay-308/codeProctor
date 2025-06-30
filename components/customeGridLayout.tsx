"use client";

import { useCallStateHooks } from "@stream-io/video-react-sdk";
interface EmojiReaction {
  id: string;
  emoji: string;
  userId: string;
  userName: string;
  timestamp: number;
}
import { AnimatePresence } from "framer-motion";
import { ParticipantTile } from "@/components/ParticipantTile";

export const CustomGridLayout = ({}: { reactions: EmojiReaction[] }) => {
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
    <div className="h-full flex items-center justify-center p-6 bg-slate-950 relative">
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
            {localParticipant && (
              <ParticipantTile
                key={localParticipant.sessionId}
                participant={localParticipant}
                isLocal={true}
              />
            )}

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
