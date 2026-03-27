import express from "express";
import {
  createContact,
  getAllContacts,
  getContactById,
  deleteContact,
  toggleContactStatus,
} from "../controllers/contactController.js";

const router = express.Router();

// Public Route
router.post("/create", createContact);

// Admin Routes
router.get("/all", getAllContacts);
router.get("/:id", getContactById);
router.delete("/delete/:id", deleteContact);
router.patch("/status/:id", toggleContactStatus);

export default router;
