// socket-server.ts
import express from "express";
import http from "http";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";

// Setup
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Types
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
  // Add more fields if needed
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

const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

// Initialize socket
const io = new SocketIOServer(server, {
  cors: {
    origin: ["http://localhost:3000", "https://code-proctor.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

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
      color: getRandomColor(),
    });

    socket.emit("room-state", {
      code: room.currentCode,
      language: room.currentLanguage,
      questionId: room.currentQuestion,
      problem: room.currentProblem,
    });

    const users = Array.from(room.users.values());
    io.to(roomId).emit("user-joined", users);
    console.log(`👤 ${userName} joined room ${roomId}`);
  });

  socket.on("code-change", ({ roomId, code, language, questionId, userId }) => {
    const room = rooms.get(roomId);
    if (room) {
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
  });

  socket.on("problem-change", ({ roomId, problem, userId }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.currentProblem = problem;
      room.currentQuestion = problem.id;

      // Also optionally reset code to default snippet
      const snippet: { lang: string; code: string } | undefined =
        problem.codeSnippets.find(
          (s: { lang: string; code: string }) =>
            s.lang.toLowerCase() === room.currentLanguage
        );
      if (snippet) room.currentCode = snippet.code;

      io.to(roomId).emit("problem-change", {
        problem,
        userId,
        timestamp: Date.now(),
      });
    }
  });

  socket.on("question-change", ({ roomId, questionId, userId }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.currentQuestion = questionId;
      socket.to(roomId).emit("question-change", { questionId, userId });
    }
  });

  socket.on("language-change", ({ roomId, language, userId }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.currentLanguage = language;

      // Optionally update code to matching snippet
      if (room.currentProblem) {
        const snippet = room.currentProblem.codeSnippets.find(
          (s) => s.lang.toLowerCase() === language
        );
        if (snippet) room.currentCode = snippet.code;
      }

      socket.to(roomId).emit("language-change", { language, userId });
    }
  });

  socket.on("cursor-move", ({ roomId, userId, position }) => {
    socket.to(roomId).emit("cursor-move", { userId, position });
  });

  socket.on("leave-room", ({ roomId, userId }) => {
    socket.leave(roomId);
    const room = rooms.get(roomId);
    if (room) {
      room.users.delete(userId);
      if (room.users.size === 0) {
        rooms.delete(roomId);
      } else {
        const users = Array.from(room.users.values());
        io.to(roomId).emit("user-left", users);
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);
    rooms.forEach((room, roomId) => {
      const userToRemove = Array.from(room.users.values()).find(
        (user) => user.socketId === socket.id
      );
      if (userToRemove) {
        room.users.delete(userToRemove.id);
        if (room.users.size === 0) {
          rooms.delete(roomId);
        } else {
          const users = Array.from(room.users.values());
          io.to(roomId).emit("user-left", users);
        }
      }
    });
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", rooms: rooms.size });
});

server.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running at http://localhost:${PORT}`);
});
