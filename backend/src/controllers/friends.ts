import {
  addFriend,
  getFriendsList,
  acceptFriendRequest,
  forceAddFriend,
  deleteFriend,
} from "../db/friends";
import { Request, Response } from "express";
import { socketsMap } from "../websockets";
import { getUserById } from "../db/users";

export async function getMyFriendsList(req: Request, res: Response) {
  const userId: number = res.locals.userId!;

  // Fetch the list of chats the user is part of
  const friendsList = await getFriendsList({ userId: Number(userId) });

  res.status(200).json(friendsList);
}

export async function makeFriendRequest(req: Request, res: Response) {
  const userId: number = res.locals.userId!;
  const currentUser = await getUserById(userId);

  // Extract the other user's ID from the request body
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Missing username in request body" });
  }

  // Create a DM between the two users
  const dm = await addFriend({ myUserId: userId, username });

  // Send the message to the socket if it exists
  const socket = socketsMap.get(dm.friendId);
  if (socket) {
    socket.send(
      JSON.stringify({
        type: "friendRequest",
        message: {
          id: userId,
          username: currentUser?.username,
        },
      })
    );
  }

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

  const currentUser = await getUserById(userId);

  // Create a DM between the two users
  const dm = await acceptFriendRequest({
    myUserId: userId,
    friendId: Number(friendId),
  });

  // Send the message to the socket if it exists
  const socket = socketsMap.get(friendId);
  if (socket) {
    socket.send(
      JSON.stringify({
        type: "friendRequestAccepted",
        message: {
          id: userId,
          friend: currentUser,
        },
      })
    );
  }

  const otherSocket = socketsMap.get(userId);
  if (otherSocket) {
    otherSocket.send(
      JSON.stringify({
        type: "friendRequestAccepted",
        message: {
          id: friendId,
          friend: dm.friend[0],
        },
      })
    );
  }

  res.status(201).json({ message: "Friend request accepted successfully", dm });
}

export async function randomFriend(req: Request, res: Response) {
  const userId: number = res.locals.userId!;
  const currentUser = await getUserById(userId);

  // Get the list of online users
  const onlineUsers = Array.from(socketsMap.keys());

  while (true) {
    const randomUserId =
      onlineUsers[Math.floor(Math.random() * onlineUsers.length)];
    if (randomUserId !== userId) {
      await forceAddFriend({
        myUserId: userId,
        friendId: randomUserId,
      });

      const socket = socketsMap.get(randomUserId);
      if (socket) {
        socket.send(
          JSON.stringify({
            type: "friendRequestAccepted",
            message: {
              id: userId,
              friend: currentUser,
            },
          })
        );
      }
      return res.status(200).json({ userId: randomUserId });
    }
  }
}

export async function removeFriend(req: Request, res: Response) {
  const userId: number = res.locals.userId!;

  // Get the user id from path params
  const friendId = +req.params.friendId;
  if (!friendId || isNaN(friendId)) {
    return res.status(400).json({ error: "Missing friendId in request body" });
  }

  try {
    deleteFriend({ userId, friendId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }

  const socket = socketsMap.get(friendId);
  if (socket) {
    socket.send(
      JSON.stringify({
        type: "friendDeleted",
        message: {
          id: userId,
        },
      })
    );
  }

  const otherSocket = socketsMap.get(userId);
  if (otherSocket) {
    otherSocket.send(
      JSON.stringify({
        type: "friendDeleted",
        message: {
          id: friendId,
        },
      })
    );
  }

  res.status(201).json({ message: "Friend request deleted successfully" });
}
