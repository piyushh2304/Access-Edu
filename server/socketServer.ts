import { Server as SocketIOServer } from "socket.io";
import http from "http";

export const initSocketServer = (server: http.Server) => {
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://access-edu.vercel.app",
    "https://access-edu-production.up.railway.app",
  ];

  if (process.env.ORIGIN) {
    try {
      if (process.env.ORIGIN.startsWith("[")) {
        const extra = JSON.parse(process.env.ORIGIN);
        allowedOrigins.push(...extra);
      } else {
        allowedOrigins.push(process.env.ORIGIN);
      }
    } catch (e) {
      console.warn('Failed to parse ORIGIN env var', e);
      allowedOrigins.push(process.env.ORIGIN);
    }
  }

  const io = new SocketIOServer(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected");

    // listen for 'notification' event from the frontend
    socket.on("notification", (data) => {
      // broadcast the notification data to all connected clients (admin dashboard)
      io.emit("newNotification", data);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};
