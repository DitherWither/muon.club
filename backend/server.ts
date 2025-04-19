import app from "./src";
import http from "http";
import { createWebSocketServer } from "./src/websockets";

const server = http.createServer(app);
createWebSocketServer(server);

server.listen(8080, () => {
  console.log("server running at http://localhost:8080");
});
