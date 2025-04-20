import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { createMessage, getMessages } from "../controllers/messages";

const router = Router();
router.use(authenticateToken);

router.get("/:otherUserId", (req, res) => {
  try {
    getMessages(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:otherUserId", (req, res) => {
  try {
    createMessage(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
