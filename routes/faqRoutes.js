// routes/faqRoutes.js
import express from "express";
import {
  addFaq,
  getFaqs,
  getFaqsByType,
  getFaqsByCity,
  getFaqsBySubCity,
  getFaqsByGirl,
  updateFaq,
  deleteFaq,
  toggleFaqStatus,
} from "../controllers/faqController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= ADMIN ================= */
router.post("/add", authMiddleware, addFaq);
router.put("/update/:id", authMiddleware, updateFaq);
router.delete("/delete/:id", authMiddleware, deleteFaq);
router.patch("/status/:id", authMiddleware, toggleFaqStatus);

/* ================= PUBLIC ================= */
router.get("/", getFaqs);

// 🔥 TYPE
router.get("/type/:type", getFaqsByType);

// 🔥 CITY
router.get("/city/:cityId", getFaqsByCity);

// 🔥 SUBCITY
router.get("/subcity/:subCityId", getFaqsBySubCity);

// 🔥 GIRL
router.get("/girl/:girlId", getFaqsByGirl);

export default router;