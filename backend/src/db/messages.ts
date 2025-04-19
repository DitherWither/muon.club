import { db } from ".";
import { directMessages } from "./schema";

/**
 * Adds a message to the given chat.
 * @param chatId - The ID of the chat to which the message will be added.
 * @param userId - The ID of the user sending the message.
 * @param content - The content of the message.
 * @returns The created message object.
 */
export async function addMessage(
  senderId: number,
  recipientId: number,
  content: string
) {
  // Insert the new message into the database
  const [newMessage] = await db
    .insert(directMessages)
    .values({
      senderId,
      recipientId,
      content,
    })
    .$returningId();

  return newMessage;
}
