import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

app.use(cors());
app.use(express.json());

type RoomUser = {
  id: string;
  name: string;
  socketId: string;
  color: string;
};

type Room = {
  users: Map<string, RoomUser>;
  currentCode: string;
  currentLanguage: string;
  currentQuestion: string;
};

const rooms = new Map<string, Room>();

const colors = [
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

function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
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

    const room = rooms.get(roomId);

    if (!room) {
      console.error(`Room ${roomId} not found after initialization.`);
      return;
    }

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

    console.log(`User ${userName} joined room ${roomId}`);
  });

  socket.on("code-change", ({ roomId, code, language, questionId, userId }) => {
    const room = rooms.get(roomId);
    if (room) {
      // room ke andar currentCode, currentLanguage aur currentQuestion ko update kar dega
      room.currentCode = code;
      room.currentLanguage = language;
      room.currentQuestion = questionId;

      // Broadcast to all users in the room except sender
      socket.to(roomId).emit("code-change", {
        code,
        language,
        questionId,
        userId,
        timestamp: Date.now(),
      });
    }
  });

  // Handle question changes
  socket.on("question-change", ({ roomId, questionId, userId }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.currentQuestion = questionId;

      socket.to(roomId).emit("question-change", {
        questionId,
        userId,
      });
    }
  });

  // Handle language changes
  socket.on("language-change", ({ roomId, language, userId }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.currentLanguage = language;

      socket.to(roomId).emit("language-change", {
        language,
        userId,
      });
    }
  });

  // Handle cursor movements
  socket.on("cursor-move", ({ roomId, userId, position }) => {
    socket.to(roomId).emit("cursor-move", {
      userId,
      position,
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // Remove user from all rooms
    rooms.forEach((room, roomId) => {
      const userToRemove = Array.from(room.users.values()).find(
        (user) => user.socketId === socket.id
      );

      if (userToRemove) {
        room.users.delete(userToRemove.id);

        // If room is empty, clean it up
        if (room.users.size === 0) {
          rooms.delete(roomId);
        } else {
          // Notify remaining users
          const users = Array.from(room.users.values());
          io.to(roomId).emit("user-left", users);
        }
      }
    });
  });

  // Handle leaving a room
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
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    rooms: rooms.size,
    timestamp: new Date().toISOString(),
  });
});

// room details get karega
app.get("/rooms/:roomId", (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);

  if (room) {
    res.json({
      roomId,
      userCount: room.users.size,
      users: Array.from(room.users.values()).map((u) => ({
        id: u.id,
        name: u.name,
        color: u.color,
      })),
      currentLanguage: room.currentLanguage,
      currentQuestion: room.currentQuestion,
    });
  } else {
    res.status(404).json({ error: "Room not found" });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Collaboration server running on port ${PORT}`);
});

export { app, server, io };

// npx nodemon --exec "node --loader ts-node/esm" pages/api/route.ts
