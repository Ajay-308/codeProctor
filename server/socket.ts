

import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

type RoomUser = {
  id: string;
  name: string;
  socketId: string;
  color: string;
};

type LeetCodeProblem = {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  codeSnippets: {
    lang: string;
    code: string;
  }[];
};

type Room = {
  users: Map<string, RoomUser>;
  currentCode: string;
  currentLanguage: string;
  currentQuestion: string;
  currentProblem: LeetCodeProblem | null;
};

const rooms = new Map<string, Room>();

const colors = [
  "#FF5733",
  "#33FF57",
  "#3357FF",
  "#FF33A1",
  "#A133FF",
  "#33FFF6",
  "#F6FF33",
  "#FF8C33",
  "#8CFF33",
  "#338CFF",
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
  "#F8C471",
  "#82E0AA",
];

const randomColor = () =>
  colors[Math.floor(Math.random() * colors.length)];

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://code-proctor.vercel.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`✅ Connected: ${socket.id}`);

  socket.on("join-room", ({ roomId, userId, userName }) => {
    socket.join(roomId);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        users: new Map(),
        currentCode: "",
        currentLanguage: "javascript",
        currentQuestion: "",
        currentProblem: null,
      });
    }

    const room = rooms.get(roomId)!;

    room.users.set(userId, {
      id: userId,
      name: userName,
      socketId: socket.id,
      color: randomColor(),
    });

    socket.emit("room-state", {
      code: room.currentCode,
      language: room.currentLanguage,
      questionId: room.currentQuestion,
      problem: room.currentProblem,
    });

    io.to(roomId).emit(
      "user-joined",
      Array.from(room.users.values())
    );

    console.log(`${userName} joined ${roomId}`);
  });

  socket.on(
    "code-change",
    ({ roomId, code, language, questionId, userId }) => {
      const room = rooms.get(roomId);

      if (!room) return;

      room.currentCode = code;
      room.currentLanguage = language;
      room.currentQuestion = questionId;

      socket.to(roomId).emit("code-change", {
        code,
        language,
        questionId,
        userId,
        timestamp: Date.now(),
      });
    }
  );

  socket.on("problem-change", ({ roomId, problem, userId }) => {
    const room = rooms.get(roomId);

    if (!room) return;

    room.currentProblem = problem;
    room.currentQuestion = problem.id;

    const snippet = problem.codeSnippets.find(
      (s: { lang: string; code: string }) =>
        s.lang.toLowerCase() === room.currentLanguage
    );

    if (snippet) {
      room.currentCode = snippet.code;
    }

    io.to(roomId).emit("problem-change", {
      problem,
      userId,
      timestamp: Date.now(),
    });
  });

  socket.on("language-change", ({ roomId, language, userId }) => {
    const room = rooms.get(roomId);

    if (!room) return;

    room.currentLanguage = language;

    if (room.currentProblem) {
      const snippet = room.currentProblem.codeSnippets.find(
        (s) => s.lang.toLowerCase() === language
      );

      if (snippet) {
        room.currentCode = snippet.code;
      }
    }

    socket.to(roomId).emit("language-change", {
      language,
      userId,
    });
  });

  socket.on("question-change", ({ roomId, questionId, userId }) => {
    const room = rooms.get(roomId);

    if (!room) return;

    room.currentQuestion = questionId;

    socket.to(roomId).emit("question-change", {
      questionId,
      userId,
    });
  });

  socket.on("cursor-move", ({ roomId, userId, position }) => {
    socket.to(roomId).emit("cursor-move", {
      userId,
      position,
    });
  });

  socket.on("leave-room", ({ roomId, userId }) => {
    socket.leave(roomId);

    const room = rooms.get(roomId);

    if (!room) return;

    room.users.delete(userId);

    if (room.users.size === 0) {
      rooms.delete(roomId);
      return;
    }

    io.to(roomId).emit(
      "user-left",
      Array.from(room.users.values())
    );
  });

  socket.on("disconnect", () => {
    console.log(`❌ Disconnected: ${socket.id}`);

    for (const [roomId, room] of rooms.entries()) {
      const user = Array.from(room.users.values()).find(
        (u) => u.socketId === socket.id
      );

      if (!user) continue;

      room.users.delete(user.id);

      if (room.users.size === 0) {
        rooms.delete(roomId);
      } else {
        io.to(roomId).emit(
          "user-left",
          Array.from(room.users.values())
        );
      }

      break;
    }
  });
});

app.get("/health", (_, res) => {
  res.json({
    success: true,
    rooms: rooms.size,
    uptime: process.uptime(),
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Socket server running on port ${PORT}`);
});