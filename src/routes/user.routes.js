import { Router } from "express";
import { registerUser, loginUsers, logoutUsers } from "../controllers/user.controller.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUsers);
router.post("/logout", logoutUsers);

export default router;