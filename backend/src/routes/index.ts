import { Router } from "express";

import auth from "./auth";
import friends from "./friends";
import messages from "./messages";

const router = Router();

router.use("/auth", auth);
router.use("/friends", friends);
router.use("/messages", messages);

export default router;
