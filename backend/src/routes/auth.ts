import { Router } from "express";
import { login, register } from "../controllers/auth";
import { getCurrentUser } from "../controllers/users";

const router = Router();

router.post("/register", (req, res) => {
  register(req, res);
});

router.post("/login", (req, res) => {
  login(req, res);
});

router.get("/me", (req, res) => {
  getCurrentUser(req, res);
});

export default router;
