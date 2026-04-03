import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken } 
    from "../controllers/user.controllers.js"
import { verifyJWT } from "../middleware/auth.middleware.js";


router.post("/refresh-token", refreshAccessToken)
const router = Router();

router.post("/register", registerUser)
router.post("/login", loginUser)
router.post("/logout", verifyJWT, logoutUser)  // protect logout
router.post("/refresh-token", refreshAccessToken)

export default router;