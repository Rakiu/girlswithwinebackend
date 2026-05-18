import express from "express";

import {
  createCity,
  getCities,
  getCityById,
  updateCity,
  deleteCity,
  updateCityImage,
  toggleCityStatus,
  getCityPage,
} from "../controllers/cityController.js";

import { generateSitemap } from "../controllers/sitemapController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================================
   PUBLIC
========================================= */

router.get(
  "/sitemap.xml",
  generateSitemap
);

// GET ALL
router.get(
  "/",
  getCities
);

// ADMIN GET
router.get(
  "/admin/:id",
  authMiddleware,
  getCityById
);

/* =========================================
   ADMIN
========================================= */

// CREATE
router.post(
  "/create",
  authMiddleware,
  createCity
);

// UPDATE
router.put(
  "/update/:id",
  authMiddleware,
  updateCity
);

// DELETE
router.delete(
  "/delete/:id",
  authMiddleware,
  deleteCity
);

// UPDATE IMAGE
router.put(
  "/image/:id",
  authMiddleware,
  updateCityImage
);

// STATUS
router.patch(
  "/status/:id",
  authMiddleware,
  toggleCityStatus
);

/* =========================================
   SEO PAGE
========================================= */

// ALWAYS LAST
router.get(
  "/:citySlug",
  getCityPage
);

export default router;