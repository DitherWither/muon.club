import { Router } from "express";
import { login, register } from "../controllers/auth";
import { getCurrentUser, updateUserHandler } from "../controllers/users";

const router = Router();

router.post("/register", (req, res) => {
  try {
    register(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", (req, res) => {
  try {
    login(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/me", (req, res) => {
  try {
    getCurrentUser(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/me", (req, res) => {
  try {
    updateUserHandler(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
