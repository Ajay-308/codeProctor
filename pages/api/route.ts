import { Server } from "socket.io";
import type { Server as HTTPServer } from "http";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Socket as NetSocket } from "net";

type NextApiResponseWithSocket = NextApiResponse & {
  socket: NetSocket & {
    server: HTTPServer & {
      io?: Server;
    };
  };
};

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

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (!res.socket.server.io) {
    console.log("Initializing Socket.io...");

    const io = new Server(res.socket.server, {
      cors: {
        origin: ["https://code-proctor.vercel.app", "http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });

    res.socket.server.io = io;

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
        if (!room) return;

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
      });

      socket.on(
        "code-change",
        ({ roomId, code, language, questionId, userId }) => {
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
        }
      );

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
        console.log("User disconnected:", socket.id);
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
  }

  res.end(); // Needed for Next.js API handler
}
