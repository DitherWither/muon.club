import { addFriend, getFriendsList, acceptFriendRequest } from "../db/friends";
import { Request, Response } from "express";

export async function getMyFriendsList(req: Request, res: Response) {
  const userId: number = res.locals.userId!;

  // Fetch the list of chats the user is part of
  const friendsList = await getFriendsList({ userId: Number(userId) });

  res.status(200).json(friendsList);
}

export async function makeFriendRequest(req: Request, res: Response) {
  const userId: number = res.locals.userId!;

  // Extract the other user's ID from the request body
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Missing username in request body" });
  }

  // Create a DM between the two users
  const dm = await addFriend({ myUserId: userId, username, isRequest: true });

  res.status(201).json({ message: "Direct message created successfully", dm });
}

export async function acceptMyFriendRequest(req: Request, res: Response) {
  // Retrieve the token from the Authorization header
  const userId: number = res.locals.userId!;

  // Extract the other user's ID from the request body
  const { friendId } = req.body;
  if (!friendId) {
    return res.status(400).json({ error: "Missing friendId in request body" });
  }

  // Create a DM between the two users
  const dm = await acceptFriendRequest({
    myUserId: userId,
    friendId: Number(friendId),
  });

  res.status(201).json({ message: "Friend request accepted successfully", dm });
}
