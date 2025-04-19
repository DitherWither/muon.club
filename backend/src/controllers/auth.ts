import { createUser, loginUser } from "../db/users";
import jwt from "jsonwebtoken"; // Import jsonwebtoken
import { env } from "../env";

export const register = async (req, res) => {
  // Call the existing createUser function with the database and input
  const userId = await createUser(req.body);

  // Generate a JWT token
  const token = jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: "1d" });

  res.status(201).json({ message: "User created successfully", token });
};

export const login = async (req, res) => {
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
};
