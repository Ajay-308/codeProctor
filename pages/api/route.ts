// socket-server.ts
import express from "express";
import http from "http";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";

// Setup
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// In-memory room structure
const rooms = new Map<
  string,
  {
    users: Map<
      string,
      { id: string; name: string; socketId: string; color: string }
    >;
    currentCode: string;
    currentLanguage: string;
    currentQuestion: string;
  }
>();

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
];
function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

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
