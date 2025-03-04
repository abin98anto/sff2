import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_BASE_URL!;

export const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"],
  autoConnect: true,
});
