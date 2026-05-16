import express from "express";

import {
  createSubCity,
  getSubCities,
  getSubCityById,
  updateSubCity,
  deleteSubCity,
  toggleSubCityStatus,
  getSubCityPage,
  getSubCitiesByCity   // ✅ MISSING FIX
} from "../controllers/subCityController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { createUploader } from "../utils/multerUpload.js";

const router = express.Router();

const uploadSubCity = createUploader("subcities");


// ---------------- PUBLIC ----------------

// GET ALL
router.get("/", getSubCities);

// GET BY CITY (⚠️ SEO route se pehle hona chahiye)
router.get("/city/:cityId", getSubCitiesByCity);

// 🔒 ADMIN GET
router.get("/admin/:id", authMiddleware, getSubCityById);


// ---------------- ADMIN ----------------

// CREATE
router.post(
  "/create",
  authMiddleware,
  uploadSubCity.single("image"),
  createSubCity
);

// UPDATE
router.put(
  "/update/:id",
  authMiddleware,
  uploadSubCity.single("image"),
  updateSubCity
);

// DELETE
router.delete(
  "/delete/:id",
  authMiddleware,
  deleteSubCity
);

// STATUS
router.patch(
  "/status/:id",
  authMiddleware,
  toggleSubCityStatus
);


// ---------------- SEO PAGE ----------------
// 🚨 ALWAYS LAST (VERY IMPORTANT)

router.get("/:subCitySlug", getSubCityPage);

export default router;
