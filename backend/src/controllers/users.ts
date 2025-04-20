import { Request, Response } from "express";
import { getUserById, updateUser } from "../db/users";

export const getCurrentUser = async (req: Request, res: Response) => {
  const userId: number = res.locals.userId;

  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const user = await getUserById(userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Return user information
  res.status(200).json(user);
  return;
};

export const updateUserHandler = async (req: Request, res: Response) => {
  const userId: number = res.locals.userId!;

  // Extract the other user's ID from the request body
  const { displayName, email, pronouns, bio } = req.body;
  if (!displayName && !email && !pronouns && !bio) {
    return res.status(400).json({ error: "Missing data in request body" });
  }

  try {
    await updateUser(userId, { displayName, pronouns, bio });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  const user = await getUserById(userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Return user information
  res.status(200).json(user);
  return;
};
