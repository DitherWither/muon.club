import { Request, Response } from "express";
import { addMessage, getMessagesBetweenUsers } from "../db/messages";
import { socketsMap } from "../websockets";

export async function getMessages(req: Request, res: Response) {
  try {
    const userId: number = res.locals.userId!;

    if (!userId) {
      return res.status(401).json({
        error: "Authentication error",
        details: "User ID not found in token",
      });
    }

    // Get other user's id from path params
    const otherUserId = +req.params.otherUserId;
    if (!otherUserId || isNaN(otherUserId)) {
      return res.status(400).json({
        error: "Invalid parameter",
        details: "otherUserId must be a valid number",
      });
    }

    // Query the database to find all messages between the two users
    const messages = await getMessagesBetweenUsers({ userId, otherUserId });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error retrieving messages:", error);

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return res.status(404).json({
          error: "Resource not found",
          details: error.message,
        });
      }

      if (error.name === "ValidationError") {
        return res.status(400).json({
          error: "Validation failed",
          details: error.message,
        });
      }
    }

    res.status(500).json({
      error: "Internal server error",
      details: "Failed to retrieve messages",
    });
  }
}

export async function createMessage(req: Request, res: Response) {
  try {
    const userId: number = res.locals.userId!;

    if (!userId) {
      return res.status(401).json({
        error: "Authentication error",
        details: "User ID not found in token",
      });
    }

    // Get other user's id from path params
    const otherUserId = +req.params.otherUserId;
    if (!otherUserId || isNaN(otherUserId)) {
      return res.status(400).json({
        error: "Invalid parameter",
        details: "otherUserId must be a valid number",
      });
    }

    // Extract the message content from the request body
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({
        error: "Missing data",
        details: "Message content is required in request body",
      });
    }

    if (typeof content !== "string") {
      return res.status(400).json({
        error: "Invalid data",
        details: "Message content must be a string",
      });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({
        error: "Invalid data",
        details: "Message content cannot be empty",
      });
    }

    // Create a DM between the two users
    const dm = await addMessage({
      senderId: userId,
      recipientId: otherUserId,
      content,
    });

    // Send the message to the recipient via WebSocket if they're online
    try {
      const socket = socketsMap.get(otherUserId);
      if (socket && socket.readyState === 1) {
        // Check if socket is open
        socket.send(
          JSON.stringify({
            type: "message",
            message: {
              id: dm.id,
              senderId: userId,
              recipientId: otherUserId,
              content,
              createdAt: new Date().toString(),
            },
          })
        );
      }
    } catch (socketError) {
      console.error("WebSocket notification failed:", socketError);
      // Continue execution even if notification fails
    }

    res.status(201).json({
      message: "Message created successfully",
      dm,
    });
  } catch (error) {
    console.error("Error creating message:", error);

    if (error instanceof Error) {
      if (error.message.includes("user not found")) {
        return res.status(404).json({
          error: "User not found",
          details: "The recipient user does not exist",
        });
      }

      if (error.name === "ValidationError") {
        return res.status(400).json({
          error: "Validation failed",
          details: error.message,
        });
      }

      if (
        error.message.includes("permission denied") ||
        error.message.includes("not allowed") ||
        error.message.includes("blocked")
      ) {
        return res.status(403).json({
          error: "Permission denied",
          details: "You cannot send messages to this user",
        });
      }
    }

    res.status(500).json({
      error: "Internal server error",
      details: "Failed to create message",
    });
  }
}
