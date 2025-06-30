import { useEffect, useState, useCallback } from "react";
import io, { Socket } from "socket.io-client";

// Adjust this if you're using .env
const SERVER_URL = "http://localhost:3001"; // or your hosted backend

let socket: Socket | null = null;

export function useRoomSync({
  roomId,
  userId,
  userName,
}: {
  roomId: string;
  userId: string;
  userName: string;
}) {
  const [connectedUsers, setConnectedUsers] = useState<
    Array<{ id: string; name: string; color: string }>
  >([]);
  const [currentQuestionId, setCurrentQuestionId] = useState<string>("");
  const [currentCode, setCurrentCode] = useState<string>("");
  const [currentLanguage, setCurrentLanguage] = useState<string>("javascript");

  // Initialize socket and join room
  useEffect(() => {
    if (!roomId || !userId || !userName) return;

    if (!socket) {
      socket = io(SERVER_URL, {
        transports: ["websocket"],
      });
    }

    socket.emit("join-room", { roomId, userId, userName });

    socket.on("room-state", ({ code, language, questionId }) => {
      setCurrentCode(code);
      setCurrentLanguage(language);
      setCurrentQuestionId(questionId);
    });

    socket.on("user-joined", (users) => {
      setConnectedUsers(users);
    });

    socket.on("user-left", (users) => {
      setConnectedUsers(users);
    });

    socket.on("code-change", ({ code, language, questionId, userId: from }) => {
      if (from !== userId) {
        setCurrentCode(code);
        setCurrentLanguage(language);
        setCurrentQuestionId(questionId);
      }
    });

    socket.on("language-change", ({ language, userId: from }) => {
      if (from !== userId) setCurrentLanguage(language);
    });

    socket.on("question-change", ({ questionId, userId: from }) => {
      if (from !== userId) setCurrentQuestionId(questionId);
    });

    return () => {
      if (socket) {
        socket.emit("leave-room", { roomId, userId });
        socket.disconnect();
        socket = null;
      }
    };
  }, [roomId, userId, userName]);

  // Send updates
  const sendCodeChange = useCallback(
    (code: string) => {
      if (!socket) return;
      setCurrentCode(code);
      socket.emit("code-change", {
        roomId,
        code,
        language: currentLanguage,
        questionId: currentQuestionId,
        userId,
      });
    },
    [roomId, userId, currentLanguage, currentQuestionId]
  );

  const sendLanguageChange = useCallback(
    (language: string) => {
      if (!socket) return;
      setCurrentLanguage(language);
      socket.emit("language-change", { roomId, language, userId });
    },
    [roomId, userId]
  );

  const sendQuestionChange = useCallback(
    (questionId: string) => {
      if (!socket) return;
      setCurrentQuestionId(questionId);
      socket.emit("question-change", { roomId, questionId, userId });
    },
    [roomId, userId]
  );

  return {
    connectedUsers,
    currentCode,
    currentLanguage,
    currentQuestionId,
    sendCodeChange,
    sendLanguageChange,
    sendQuestionChange,
  };
}
