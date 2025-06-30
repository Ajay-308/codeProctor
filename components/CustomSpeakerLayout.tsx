"use client";

import { useCallStateHooks } from "@stream-io/video-react-sdk";
import { ParticipantTile } from "./ParticipantTile";
interface EmojiReaction {
  id: string;
  emoji: string;
  userId: string;
  userName: string;
  timestamp: number;
}

export const CustomSpeakerLayout = ({}: { reactions: EmojiReaction[] }) => {
  const { useParticipants, useLocalParticipant, useDominantSpeaker } =
    useCallStateHooks();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();
  const dominantSpeaker = useDominantSpeaker();
  const mainSpeaker = dominantSpeaker || localParticipant;
  const otherParticipants = participants.filter(
    (p) => p.sessionId !== mainSpeaker?.sessionId
  );

  return (
    <div className="h-full bg-white relative flex flex-col">
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
