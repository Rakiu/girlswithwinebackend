import express from "express";

import {
  createCity,
  getCities,
  getCityById,
  updateCity,
  deleteCity,
  updateCityImage,
  toggleCityStatus,
  getCityPage
} from "../controllers/cityController.js";

import { generateSitemap } from "../controllers/sitemapController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createUploader } from "../utils/multerUpload.js";

const router = express.Router();

const uploadCity = createUploader("cities");


// ---------------- PUBLIC ----------------

router.get("/sitemap.xml", generateSitemap);

// better REST
router.get("/", getCities);

// 🔒 protect admin
router.get("/admin/:id", authMiddleware, getCityById);


// ---------------- ADMIN ----------------

router.post(
  "/create",
  authMiddleware,
  uploadCity.single("image"),
  createCity
);

router.put(
  "/update/:id",
  authMiddleware,
  uploadCity.single("image"),
  updateCity
);

router.delete(
  "/delete/:id",
  authMiddleware,
  deleteCity
);

router.put(
  "/image/:id",
  authMiddleware,
  uploadCity.single("image"),
  updateCityImage
);

router.patch(
  "/status/:id",
  authMiddleware,
  toggleCityStatus
);


// ---------------- SEO PAGE ----------------
// ALWAYS LAST (IMPORTANT)

router.get("/:citySlug", getCityPage);

export default router;