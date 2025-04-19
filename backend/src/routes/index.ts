import { Router } from "express";

import auth from "./auth";
import friends from "./friends";

const router = Router();

router.use("/auth", auth);
router.use("/friends", friends);

export default router;
