import { useEffect, useState } from "react";
import io from "socket.io-client";

type SocketType = ReturnType<typeof io>;

let socketInstance: SocketType | null = null;

export const useSocket = () => {
  const [socket, setSocket] = useState<SocketType | null>(null);
  const route = "https://codeproctor-0.onrender.com";

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io(route, { transports: ["websocket"] });
    }
    setSocket(socketInstance);

    return () => {
      socketInstance?.disconnect();
      socketInstance = null;
    };
  }, []);

  return socket;
};
