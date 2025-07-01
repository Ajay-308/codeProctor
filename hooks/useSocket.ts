// hooks/useSocket.ts
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const route = "https://codeproctor-0.onrender.com";

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io(route!, {
        transports: ["websocket"],
      });
    }
    setSocket(socketInstance);

    return () => {
      socketInstance?.disconnect();
      socketInstance = null;
    };
  }, []);

  return socket;
};
