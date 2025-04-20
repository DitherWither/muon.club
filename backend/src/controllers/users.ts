import { Request, Response } from "express";
import { getUserById, updateUser } from "../db/users";

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId: number = res.locals.userId;

    if (!userId) {
      return res.status(401).json({
        error: "Authentication error",
        details: "User ID not found in token",
      });
    }

    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        details: "The requested user account does not exist",
      });
    }

    // Return user information
    res.status(200).json(user);
  } catch (error) {
    console.error("Error retrieving user profile:", error);

    if (error instanceof Error) {
      if (
        error.message.includes("database") ||
        error.message.includes("connection")
      ) {
        return res.status(503).json({
          error: "Service unavailable",
          details: "Database connection error",
        });
      }
    }

    res.status(500).json({
      error: "Internal server error",
      details: "Failed to retrieve user information",
    });
  }
};

export const updateUserHandler = async (req: Request, res: Response) => {
  try {
    const userId: number = res.locals.userId!;

    if (!userId) {
      return res.status(401).json({
        error: "Authentication error",
        details: "User ID not found in token",
      });
    }

    // Extract the fields from the request body
    const { displayName, email, pronouns, bio } = req.body;

    // Validate input data
    if (!displayName && !email && !pronouns && !bio) {
      return res.status(400).json({
        error: "Missing data",
        details:
          "At least one field (displayName, email, pronouns, bio) is required in request body",
      });
    }

    // Additional validation for field formats
    if (
      displayName &&
      (typeof displayName !== "string" || displayName.length > 255)
    ) {
      return res.status(400).json({
        error: "Invalid data",
        details:
          "Display name must be a string with maximum length of 255 characters",
      });
    }

    if (pronouns && (typeof pronouns !== "string" || pronouns.length > 50)) {
      return res.status(400).json({
        error: "Invalid data",
        details:
          "Pronouns must be a string with maximum length of 50 characters",
      });
    }

    if (bio && (typeof bio !== "string" || bio.length > 2048)) {
      return res.status(400).json({
        error: "Invalid data",
        details: "Bio must be a string with maximum length of 2048 characters",
      });
    }

    // Update the user profile
    await updateUser(userId, { displayName, pronouns, bio });

    // Fetch updated user data
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        details: "The user account could not be found after update",
      });
    }

    // Return updated user information
    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating user profile:", error);

    if (error instanceof Error) {
      if (error.name === "ValidationError") {
        return res.status(400).json({
          error: "Validation failed",
          details: error.message,
        });
      }

      if (
        error.message.includes("Constraint violated") ||
        error.message.includes("Duplicate entry")
      ) {
        return res.status(409).json({
          error: "Conflict",
          details: "Username or email is already taken by another user",
        });
      }

      if (
        error.message.includes("database") ||
        error.message.includes("connection")
      ) {
        return res.status(503).json({
          error: "Service unavailable",
          details: "Database connection error",
        });
      }
    }

    res.status(500).json({
      error: "Internal server error",
      details: "Failed to update user information",
    });
  }
};
