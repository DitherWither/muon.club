import { WebSocketServer } from "ws";
import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser"; // Import cookie-parser
import { createUser, loginUser } from "./db/users"; // Import the existing createUser function and loginUser function
import cors from "cors";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(bodyParser.json()); // Middleware to parse JSON input
app.use(cors());
app.use(cookieParser(process.env.COOKIE_SECRET!)); // Middleware to parse signed cookies

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

app.post("/register", (req, res) => {
  (async () => {
    try {
      // Call the existing createUser function with the database and input
      const userId = await createUser(req.body);

      // Set a signed cookie for authentication
      res.cookie("authToken", userId, {
        httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
        signed: true, // Sign the cookie
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      console.error(error);

      // Handle validation errors or other issues
      if (error.name === "ValidationError") {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ error: "Internal server error" });
    }
  })();
});

app.post("/login", async (req, res) => {
  try {
    // Call the loginUser function with the input
    const { username, password } = req.body;
    const user = await loginUser({ username, password });

    // Set a signed cookie for authentication
    res.cookie("authToken", user.id, {
      httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
      signed: true, // Sign the cookie
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({
      message: "Login successful",
      user: { id: user.id, username: user.username },
    });
  } catch (error) {
    console.error(error);

    // Handle login errors
    res.status(401).json({ error: "Invalid username or password" });
  }
});

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

server.listen(8080, () => {
  console.log("server running at http://localhost:8080");
});
