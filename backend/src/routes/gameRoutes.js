import express from "express";
import { createGame, getGameById } from "../controllers/gameController.js";

const router = express.Router();

router.post("/", createGame);
router.get("/:id", getGameById);

export default router;
