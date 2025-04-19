import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { env } from "../env";
import { users } from "../db/schema";
import { getUserById } from "../db/users";

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
