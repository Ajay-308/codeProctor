// hooks/useRoomSync.ts
import { useEffect, useState, useCallback } from "react";
import { Socket } from "socket.io-client";

type CodeSnippet = {
  lang: string;
  code: string;
};

type Problem = {
  id: string;
  title: string;
  description: string;
  codeSnippets: CodeSnippet[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

type RoomState = {
  code: string;
  language: string;
  questionId: string;
  problem: Problem | null;
};

type User = {
  id: string;
  name: string;
  socketId: string;
  color: string;
};

type UseRoomSyncProps = {
  socket: Socket | null;
  userId: string;
  userName: string;
  roomId: string;
};

export function useRoomSync({
  socket,
  userId,
  userName,
  roomId,
}: UseRoomSyncProps) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [questionId, setQuestionId] = useState("");
  const [problem, setProblem] = useState<Problem | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Initial join
  useEffect(() => {
    if (!socket || !userId || !roomId) return;

    socket.emit("join-room", { roomId, userId, userName });

    return () => {
      socket.emit("leave-room", { roomId, userId });
    };
  }, [socket, roomId, userId, userName]);

  // Sync listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("room-state", (state: RoomState) => {
      setCode(state.code);
      setLanguage(state.language);
      setQuestionId(state.questionId);
      setProblem(state.problem);
    });

    socket.on("user-joined", (users: User[]) => {
      setUsers(users);
    });

    socket.on("user-left", (users: User[]) => {
      setUsers(users);
    });

    socket.on("problem-change", ({ problem }: { problem: Problem }) => {
      setProblem(problem);
      setQuestionId(problem.id);
      const snippet = problem.codeSnippets.find(
        (s) => s.lang.toLowerCase() === language
      );
      if (snippet) setCode(snippet.code);
    });

    socket.on("language-change", ({ language }: { language: string }) => {
      setLanguage(language);
      if (problem) {
        const snippet = problem.codeSnippets.find(
          (s) => s.lang.toLowerCase() === language
        );
        if (snippet) setCode(snippet.code);
      }
    });

    socket.on("code-change", ({ code }: { code: string }) => {
      setCode(code);
    });

    return () => {
      socket.off("room-state");
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("problem-change");
      socket.off("language-change");
      socket.off("code-change");
    };
  }, [socket, problem, language]);

  // Emitters
  const changeProblem = useCallback(
    (newProblem: Problem) => {
      if (!socket) {
        console.error("Socket is undefined during problem change");
        return;
      }

      // Emit to others
      socket.emit("problem-change", { roomId, problem: newProblem, userId });

      // Update local state immediately
      setProblem(newProblem);
      setQuestionId(newProblem.id);

      const snippet = newProblem.codeSnippets.find(
        (s) => s.lang.toLowerCase() === language
      );
      if (snippet) setCode(snippet.code);
    },
    [socket, roomId, userId, language]
  );

  const changeLanguage = useCallback(
    (lang: string) => {
      socket?.emit("language-change", { roomId, language: lang, userId });
    },
    [socket, roomId, userId]
  );

  const updateCode = useCallback(
    (newCode: string) => {
      socket?.emit("code-change", {
        roomId,
        code: newCode,
        language,
        questionId,
        userId,
      });
      setCode(newCode);
    },
    [socket, roomId, language, questionId, userId]
  );

  return {
    roomId,
    code,
    setCode: updateCode,
    language,
    setLanguage: changeLanguage,
    questionId,
    problem,
    setProblem: changeProblem,
    users,
  };
}
