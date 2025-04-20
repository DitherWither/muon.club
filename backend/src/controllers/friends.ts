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
  try {
    const userId: number = res.locals.userId!;

    if (!userId) {
      return res.status(401).json({
        error: "Authentication error",
        details: "User ID not found in token",
      });
    }

    // Fetch the list of chats the user is part of
    const friendsList = await getFriendsList({ userId: Number(userId) });

    res.status(200).json(friendsList);
  } catch (error) {
    console.error("Error getting friends list:", error);

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return res.status(404).json({
          error: "Resource not found",
          details: error.message,
        });
      }
    }

    res.status(500).json({
      error: "Internal server error",
      details: "Failed to retrieve friends list",
    });
  }
}

export async function makeFriendRequest(req: Request, res: Response) {
  try {
    const userId: number = res.locals.userId!;

    if (!userId) {
      return res.status(401).json({
        error: "Authentication error",
        details: "User ID not found in token",
      });
    }

    // Extract the other user's ID from the request body
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({
        error: "Missing data",
        details: "Username is required in request body",
      });
    }

    // Get current user info for the notification
    const currentUser = await getUserById(userId);
    if (!currentUser) {
      return res.status(404).json({
        error: "User not found",
        details: "Current user account could not be found",
      });
    }

    // Create a DM between the two users
    const dm = await addFriend({ myUserId: userId, username });

    // Send the message to the socket if it exists
    const socket = socketsMap.get(dm.friendId);
    if (socket) {
      try {
        socket.send(
          JSON.stringify({
            type: "friendRequest",
            message: {
              id: userId,
              username: currentUser.username,
            },
          })
        );
      } catch (socketError) {
        console.error("WebSocket notification failed:", socketError);
        // Continue execution even if notification fails
      }
    }

    res.status(201).json({ message: "Friend request sent successfully", dm });
  } catch (error) {
    console.error("Error sending friend request:", error);

    if (error instanceof Error) {
      if (error.message.includes("cannot send a friend request to yourself")) {
        return res.status(400).json({
          error: "Invalid request",
          details: "You cannot send a friend request to yourself",
        });
      }

      if (error.message.includes("not found")) {
        return res.status(404).json({
          error: "User not found",
          details: "The requested username does not exist",
        });
      }

      if (error.message.includes("already exists")) {
        return res.status(409).json({
          error: "Duplicate request",
          details: "Friend request already exists",
        });
      }
    }

    res.status(500).json({
      error: "Internal server error",
      details: "Failed to create friend request",
    });
  }
}

export async function acceptMyFriendRequest(req: Request, res: Response) {
  try {
    // Retrieve the user ID from the token
    const userId: number = res.locals.userId!;

    if (!userId) {
      return res.status(401).json({
        error: "Authentication error",
        details: "User ID not found in token",
      });
    }

    // Extract the other user's ID from the request body
    const { friendId } = req.body;
    if (!friendId) {
      return res.status(400).json({
        error: "Missing data",
        details: "Friend ID is required in request body",
      });
    }

    const friendIdNum = Number(friendId);
    if (isNaN(friendIdNum)) {
      return res.status(400).json({
        error: "Invalid data",
        details: "Friend ID must be a number",
      });
    }

    // Get current user info for the notification
    const currentUser = await getUserById(userId);
    if (!currentUser) {
      return res.status(404).json({
        error: "User not found",
        details: "Current user account could not be found",
      });
    }

    // Accept the friend request
    const dm = await acceptFriendRequest({
      myUserId: userId,
      friendId: friendIdNum,
    });

    // Send notifications via WebSockets
    try {
      // Notify the friend
      const socket = socketsMap.get(friendIdNum);
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

      // Notify the current user
      const otherSocket = socketsMap.get(userId);
      if (otherSocket) {
        otherSocket.send(
          JSON.stringify({
            type: "friendRequestAccepted",
            message: {
              id: friendIdNum,
              friend: dm.friend[0],
            },
          })
        );
      }
    } catch (socketError) {
      console.error("WebSocket notification failed:", socketError);
      // Continue execution even if notification fails
    }

    res
      .status(200)
      .json({ message: "Friend request accepted successfully", dm });
  } catch (error) {
    console.error("Error accepting friend request:", error);

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return res.status(404).json({
          error: "Request not found",
          details: "No pending friend request found from this user",
        });
      }
    }

    res.status(500).json({
      error: "Internal server error",
      details: "Failed to accept friend request",
    });
  }
}

export async function randomFriend(req: Request, res: Response) {
  try {
    const userId: number = res.locals.userId!;

    if (!userId) {
      return res.status(401).json({
        error: "Authentication error",
        details: "User ID not found in token",
      });
    }

    // Get current user info for the notification
    const currentUser = await getUserById(userId);
    if (!currentUser) {
      return res.status(404).json({
        error: "User not found",
        details: "Current user account could not be found",
      });
    }

    // Get the list of online users
    const onlineUsers = Array.from(socketsMap.keys());

    if (onlineUsers.length <= 1) {
      return res.status(404).json({
        error: "No users available",
        details: "No other online users available for random matching",
      });
    }

    // Find a random user that isn't the current user
    let attempts = 0;
    const maxAttempts = 10; // Prevent infinite loops

    while (attempts < maxAttempts) {
      const randomUserId =
        onlineUsers[Math.floor(Math.random() * onlineUsers.length)];

      if (randomUserId !== userId) {
        try {
          await forceAddFriend({
            myUserId: userId,
            friendId: randomUserId,
          });

          // Send notification via WebSocket
          try {
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
          } catch (socketError) {
            console.error("WebSocket notification failed:", socketError);
            // Continue execution even if notification fails
          }

          return res.status(200).json({
            message: "Random friend added successfully",
            userId: randomUserId,
          });
        } catch (addError) {
          console.error("Error adding random friend:", addError);
          attempts++;
          continue; // Try another user
        }
      }
      attempts++;
    }

    return res.status(500).json({
      error: "Operation failed",
      details:
        "Could not find a suitable random friend after multiple attempts",
    });
  } catch (error) {
    console.error("Error finding random friend:", error);
    res.status(500).json({
      error: "Internal server error",
      details: "Failed to find a random friend",
    });
  }
}

export async function removeFriend(req: Request, res: Response) {
  try {
    const userId: number = res.locals.userId!;

    if (!userId) {
      return res.status(401).json({
        error: "Authentication error",
        details: "User ID not found in token",
      });
    }

    // Get the user id from path params
    const friendId = +req.params.friendId;
    if (!friendId || isNaN(friendId)) {
      return res.status(400).json({
        error: "Invalid data",
        details: "Valid friend ID is required in request parameters",
      });
    }

    // Delete the friendship
    await deleteFriend({ userId, friendId });

    // Send notifications via WebSockets
    try {
      // Notify the friend
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

      // Notify the current user
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
    } catch (socketError) {
      console.error("WebSocket notification failed:", socketError);
      // Continue execution even if notification fails
    }

    res.status(200).json({ message: "Friend removed successfully" });
  } catch (error) {
    console.error("Error removing friend:", error);

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return res.status(404).json({
          error: "Friendship not found",
          details: "No friendship exists between these users",
        });
      }
    }

    res.status(500).json({
      error: "Internal server error",
      details: "Failed to remove friend",
    });
  }
}
