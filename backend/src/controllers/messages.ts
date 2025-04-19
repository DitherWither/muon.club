import { Request, Response } from "express";
import { addMessage, getMessagesBetweenUsers } from "../db/messages";
import { socketsMap } from "../websockets";

export async function getMessages(req: Request, res: Response) {
  const userId: number = res.locals.userId!;

  // Get other user's id from path params
  const otherUserId = +req.params.otherUserId;
  if (!otherUserId || isNaN(otherUserId)) {
    return res.status(400).json({ error: "Invalid otherUserId" });
  }

  // Query the database to find all messages between the two users
  const messages = await getMessagesBetweenUsers({ userId, otherUserId });

  res.status(200).json(messages);
}

export async function createMessage(req: Request, res: Response) {
  const userId: number = res.locals.userId!;

  // Get other user's id from path params
  const otherUserId = +req.params.otherUserId;
  if (!otherUserId || isNaN(otherUserId)) {
    return res.status(400).json({ error: "Invalid otherUserId" });
  }

  // Extract the other user's ID from the request body
  const { content } = req.body;
  if (!otherUserId) {
    return res
      .status(400)
      .json({ error: "Missing otherUserId in request body" });
  }
  if (!content) {
    return res.status(400).json({ error: "Missing content in request body" });
  }

  // Send the message to the socket if it exists

  // Create a DM between the two users
  const dm = await addMessage({
    senderId: userId,
    recipientId: otherUserId,
    content,
  });

  const socket = socketsMap.get(otherUserId);
  if (socket) {
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

  res.status(201).json({ message: "Message created successfully", dm });
}
