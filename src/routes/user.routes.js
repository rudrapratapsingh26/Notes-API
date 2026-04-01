import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js";

const router = Router();

router.post("/register", registerUser);
// router.post("/login", loginUsers);
// router.post("/logout", logoutUsers);

export default router;