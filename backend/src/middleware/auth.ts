import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../env";

/**
 * Middleware to authenticate API requests using JWT tokens
 * Extracts token from Authorization header, verifies it,
 * and stores the userId in res.locals for downstream use
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract token from authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];

    // Verify the token
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: number };

    // Store the userId in res.locals for use in subsequent middleware or route handlers
    res.locals.userId = decoded.userId;

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    // Handle token verification errors
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: "Invalid token" });
      return;
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: "Token expired" });
      return;
    } else {
      console.error("Authentication error:", error);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
  }
};

/**
 * Optional middleware that doesn't reject the request if no token is provided
 * but still verifies and extracts user info if a token exists
 */
export const optionalAuthentication = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // No token provided, but that's okay - continue without authentication
      return next();
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: number };
      res.locals.userId = decoded.userId;
    } catch (tokenError) {
      // Invalid token, but we'll continue without authentication
      console.warn(
        "Invalid token in optional authentication:",
        tokenError.message
      );
    }

    next();
  } catch (error) {
    console.error("Error in optional authentication:", error);
    next(); // Continue anyway since this is optional authentication
  }
};
