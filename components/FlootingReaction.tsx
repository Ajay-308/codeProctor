import { motion, AnimatePresence } from "framer-motion";

interface EmojiReaction {
  id: string;
  emoji: string;
  userId: string;
  userName: string;
  timestamp: number;
}

export const FloatingReactions = ({
  reactions,
}: {
  reactions: EmojiReaction[];
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      <AnimatePresence>
        {reactions.map((reaction) => {
          const startX = Math.random() * 10 + 10; // 10% to 90% from left
          const startY = Math.random() * 60 + 30; // 30% to 90% from top

          return (
            <motion.div
              key={reaction.id}
              initial={{
                x: `${startX}vw`,
                y: `${startY}vh`,
                scale: 0,
                opacity: 0,
                rotate: -10 + Math.random() * 20,
              }}
              animate={{
                y: `${startY - 20}vh`,
                scale: [0, 1.2, 1, 1.1, 0.9, 0],
                opacity: [0, 1, 1, 1, 0.8, 0],
                rotate: -10 + Math.random() * 20,
              }}
              exit={{
                opacity: 0,
                scale: 0,
              }}
              transition={{
                duration: 4,
                ease: "easeOut",
                times: [0, 0.15, 0.3, 0.7, 0.85, 1],
              }}
              className="absolute text-6xl font-bold drop-shadow-lg"
            >
              {reaction.emoji}
              {/* User name below emoji */}
              <div className="text-sm text-white bg-black/50 px-2 py-1 rounded-full mt-2 text-center whitespace-nowrap">
                {reaction.userName}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
