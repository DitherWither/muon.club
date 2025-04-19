import { db } from "./index";
import { eq, and, or } from "drizzle-orm";
import { directMessages, friends, users } from "./schema";
import { getUserIdByUsername } from "./users";

/**
 * Adds a friend to the user's friends list.
 * @param username - The username of the friend.
 * @param myUserId - The ID of the user sending the friend request.
 */
export async function addFriend({
  username,
  myUserId,
  isRequest,
}: {
  username: string;
  myUserId: number;
  isRequest: boolean;
}) {
  // Get the user ID of the recipient by username
  const recipientUserId = await getUserIdByUsername(username);
  if (recipientUserId === myUserId) {
    throw new Error("You cannot send a friend request to yourself.");
  }

  // Check if the friend request already exists
  const existingRequest = await db
    .select()
    .from(friends)
    .where(
      and(eq(friends.userId, myUserId), eq(friends.friendId, recipientUserId))
    )
    .limit(1)
    .execute();

  if (existingRequest.length > 0) {
    return existingRequest[0]; // Return the existing friend request if found
  }

  // Insert the new friend request into the database
  const [newFriendRequest] = await db
    .insert(friends)
    .values({
      userId: myUserId,
      friendId: recipientUserId,
      isRequest,
    })
    .$returningId();

  return newFriendRequest;
}

/**
 * Accepts a friend request.
 * @param myUserId - The ID of the user accepting the friend request.
 * @param friendId - The ID of the friend whose request is being accepted.
 */
export async function acceptFriendRequest({
  myUserId,
  friendId,
}: {
  myUserId: number;
  friendId: number;
}) {
  // Check if the friend request exists
  const existingRequest = await db
    .select()
    .from(friends)
    .where(and(eq(friends.userId, friendId), eq(friends.friendId, myUserId)))
    .limit(1)
    .execute();

  if (existingRequest.length === 0) {
    throw new Error("Friend request not found.");
  }

  // Update the friend request to indicate that it has been accepted
  await db
    .update(friends)
    .set({ isRequest: false })
    .where(eq(friends.id, existingRequest[0].id));

  return existingRequest[0];
}

export async function getFriends({ userId }: { userId: number }) {
  // TODO: This is most probably slow, cache it
  return await db
    .select({
      id: users.id,
      displayName: users.displayName,
      username: users.username,
      pronouns: users.pronouns,
      bio: users.bio,
    })
    .from(friends)
    .where(and(eq(friends.friendId, userId), eq(friends.isRequest, false)))
    .innerJoin(users, eq(users.id, friends.userId))
    .union(
      db
        .select({
          id: users.id,
          displayName: users.displayName,
          username: users.username,
          pronouns: users.pronouns,
          bio: users.bio,
        })
        .from(friends)
        .where(and(eq(friends.userId, userId), eq(friends.isRequest, false)))
        .innerJoin(users, eq(users.id, friends.friendId))
    );
}

async function getFriendRequests(userId: number) {
  // Query the database to find all friend requests for the given user
  const friendRequests = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      username: users.username,
      pronouns: users.pronouns,
      bio: users.bio,
    })
    .from(friends)
    .innerJoin(users, eq(users.id, friends.userId))
    .where(and(eq(friends.friendId, userId), eq(friends.isRequest, true)));
  return friendRequests;
}

export async function getFriendsList({ userId }: { userId: number }) {
  const friends = await getFriends({ userId });
  const friendRequests = await getFriendRequests(userId);
  return { friends, friendRequests };
}
