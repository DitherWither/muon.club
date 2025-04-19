import http from "http";
import { env } from "process";
import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";

export const socketsMap = new Map<number, WebSocket>();

export function createWebSocketServer(server: http.Server) {
  const wss = new WebSocketServer({ server });

  // WebSocket server logic
  wss.on("connection", (ws) => {
    ws.on("error", (error) => {
      console.error(error);
    });
    let userId: number | undefined;
    console.log("WebSocket connection established");

    ws.on("message", (message) => {
      const messageData = JSON.parse(message.toString());

      if (messageData.type === "authenticate") {
        const jwtToken = messageData.token;

        if (!jwtToken) {
          ws.send(
            JSON.stringify({ type: "error", message: "No token provided" })
          );
          return;
        }

        try {
          const decoded = jwt.verify(jwtToken, env.JWT_SECRET) as {
            userId: number;
          };
          userId = decoded.userId;

          console.log(userId);
          socketsMap.set(userId, ws);

          ws.send(JSON.stringify({ type: "authenticated" }));
        } catch (jwtError) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Invalid or expired token",
            })
          );
        }
      }
    });

    ws.on("close", () => {
      console.log("WebSocket connection closed");
      if (userId) {
        socketsMap.delete(userId);
      }
    });
  });
}
