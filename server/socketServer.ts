import { Server as SocketIOServer } from "socket.io";
import http from "http";

export const initSocketServer = (server: http.Server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://access-edu.vercel.app",
        "https://access-edu-production.up.railway.app",
        ...(process.env.ORIGIN ? (
          process.env.ORIGIN.startsWith("[")
            ? JSON.parse(process.env.ORIGIN)
            : [process.env.ORIGIN]
        ) : [])
      ],
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
