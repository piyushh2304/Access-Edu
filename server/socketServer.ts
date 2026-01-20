import { Server as SocketIOServer } from "socket.io";
import http from "http";

export const initSocketServer = (server: http.Server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: (origin, callback) => {
        const originEnv = process.env.ORIGIN;
        if (!origin || !originEnv) {
          return callback(null, true);
        }

        const allowedOrigins = originEnv.split(",").map((o) => o.trim());
        // For socket.io, we need to return the specific matched origin, not just true, 
        // effectively handled by Set(allowedOrigins).has(origin)
        if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
          callback(null, origin);
        } else {
          console.error(`[Socket CORS Blocked] Origin: '${origin}'`);
          callback(new Error("Not allowed by CORS"));
        }
      },
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
