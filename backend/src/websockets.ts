import http from "http";
import { WebSocketServer } from "ws";

export function createWebSocketServer(server: http.Server) {
  const wss = new WebSocketServer({ server });

  // WebSocket server logic
  wss.on("connection", (ws) => {
    console.log("New WebSocket connection");

    ws.on("message", (message) => {
      console.log(`Received message: ${message}`);
      const parsedMessage = JSON.parse(message.toString());
      ws.send(
        JSON.stringify({
          text: `Hello, you sent: ${parsedMessage.text}`,
          sender: "other",
        })
      );
    });

    ws.on("error", (error) => {
      console.error(error);
    });

    ws.send(
      JSON.stringify({
        text: "Hello! Message from server",
        sender: "system",
      })
    );
  });
}
