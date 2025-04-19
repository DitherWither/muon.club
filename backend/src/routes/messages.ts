import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { createMessage, getMessages } from "../controllers/messages";

const router = Router();
router.use(authenticateToken);

router.get("/:otherUserId", (req, res) => {
  getMessages(req, res);
});

router.post("/:otherUserId", (req, res) => {
  createMessage(req, res);
});

export default router;
