import { createUser, loginUser } from "../db/users";
import jwt from "jsonwebtoken"; // Import jsonwebtoken
import { env } from "../env";

export const register = async (req, res) => {
  try {
    // Validate request body
    if (
      !req.body ||
      !req.body.username ||
      !req.body.password ||
      !req.body.email
    ) {
      return res.status(400).json({
        error: "Missing required fields",
        details: "Username, password, and email are required",
      });
    }

    // Call the existing createUser function with the database and input
    const userId = await createUser(req.body);

    // Generate a JWT token
    const token = jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: "1d" });

    res.status(201).json({ message: "User created successfully", token });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle specific error types
    if (
      error.message?.includes("Constraint violated") ||
      error.message?.includes("Duplicate entry")
    ) {
      return res.status(409).json({
        error: "User already exists",
        details: "Username or email is already taken",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation failed",
        details: error.message,
      });
    }

    // Generic server error
    res.status(500).json({
      error: "Registration failed",
      details: "An unexpected error occurred during registration",
    });
  }
};

export const login = async (req, res) => {
  try {
    // Validate request body
    if (!req.body || !req.body.username || !req.body.password) {
      return res.status(400).json({
        error: "Missing credentials",
        details: "Both username and password are required",
      });
    }

    // Call the loginUser function with the input
    const { username, password } = req.body;
    const user = await loginUser({ username, password });

    // Generate a JWT token
    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user.id, username: user.username },
    });
  } catch (error) {
    console.error("Login error:", error);

    // Handle authentication errors with a generic message for security
    if (error.message === "Invalid username or password") {
      return res.status(401).json({
        error: "Authentication failed",
        details: "Invalid username or password",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation failed",
        details: error.message,
      });
    }

    // Generic server error
    res.status(500).json({
      error: "Login failed",
      details: "An unexpected error occurred during login",
    });
  }
};
