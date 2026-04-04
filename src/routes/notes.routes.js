import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {getNotes, createNote, getNote, updateNote, deleteNote,} from "../controllers/notes.controllers.js";

const router = Router();

router.use(verifyJWT);
router.route("/").get(getNotes).post(createNote);
router.route("/:id").get(getNote).patch(updateNote).delete(deleteNote);

export default router;
