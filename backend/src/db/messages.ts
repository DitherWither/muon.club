import { db } from ".";
import { directMessages } from "./schema";
import { and, asc, desc, eq, or, sql } from "drizzle-orm";

/**
 * Adds a message to the given chat.
 * @param chatId - The ID of the chat to which the message will be added.
 * @param userId - The ID of the user sending the message.
 * @param content - The content of the message.
 * @returns The created message object.
 */
export async function addMessage({
  senderId,
  recipientId,
  content,
}: {
  senderId: number;
  recipientId: number;
  content: string;
}) {
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

export async function getMessagesBetweenUsers({
  userId,
  otherUserId,
  limit,
  offset,
}: {
  userId: number;
  otherUserId: number;
  limit?: number;
  offset?: number;
}) {
  // Query the database to find all messages between the two users
  const messages = await db
    .select({
      id: directMessages.id,
      senderId: directMessages.senderId,
      recipientId: directMessages.recipientId,
      content: directMessages.content,
      createdAt: directMessages.createdAt,
    })
    .from(directMessages)
    .where(
      or(
        and(
          eq(directMessages.senderId, userId),
          eq(directMessages.recipientId, otherUserId)
        ),
        and(
          eq(directMessages.senderId, otherUserId),
          eq(directMessages.recipientId, userId)
        )
      )
    )
    .orderBy(desc(directMessages.createdAt))
    .limit(limit ?? 100)
    .offset(offset ?? 0);

  messages.reverse();

  return messages;
}
