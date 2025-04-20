import { Router } from "express";
import {
  getMyFriendsList,
  makeFriendRequest,
  acceptMyFriendRequest,
  randomFriend,
  removeFriend,
} from "../controllers/friends";
import { authenticateToken } from "../middleware/auth";

const router = Router();
router.use(authenticateToken);

router.get("/", (req, res) => {
  try {
    getMyFriendsList(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", (req, res) => {
  try {
    makeFriendRequest(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/accept", (req, res) => {
  try {
    acceptMyFriendRequest(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/random", (req, res) => {
  try {
    randomFriend(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:friendId", (req, res) => {
  try {
    removeFriend(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
