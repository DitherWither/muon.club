import { Router } from "express";
import {
  getMyFriendsList,
  makeFriendRequest,
  acceptMyFriendRequest,
  randomFriend,
} from "../controllers/friends";
import { authenticateToken } from "../middleware/auth";

const router = Router();
router.use(authenticateToken);

router.get("/", async (req, res) => {
  getMyFriendsList(req, res);
});

router.post("/", async (req, res) => {
  makeFriendRequest(req, res);
});

router.post("/accept", async (req, res) => {
  acceptMyFriendRequest(req, res);
});

router.post("/random", async (req, res) => {
  randomFriend(req, res);
});

export default router;
