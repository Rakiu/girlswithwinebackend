import express from "express";
import {
  createState,
  getStates,
  getStateById,
  updateState,
  deleteState,
  toggleStateStatus,
} from "../controllers/stateController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// ------------------- CREATE STATE ------------------- //
router.post("/create", authMiddleware, createState);

// ------------------- GET ALL STATES ------------------- //
router.get("/list", getStates);

// ------------------- GET SINGLE STATE ------------------- //
router.get("/:id", getStateById);

// ------------------- UPDATE STATE ------------------- //
router.put("/update/:id", authMiddleware, updateState);

// ------------------- DELETE STATE ------------------- //
router.delete("/delete/:id", authMiddleware, deleteState);

// ------------------- TOGGLE STATUS ------------------- //
router.patch("/status/:id", authMiddleware, toggleStateStatus);

export default router;
