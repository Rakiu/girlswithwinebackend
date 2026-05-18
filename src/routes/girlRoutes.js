import express from "express";

import {
  addGirl,
  getGirlsByCity,
  getGirlsBySubCity,
  deleteGirl,
  toggleGirlStatus,
  getAllGirls,
  updateGirl,
  getGirlById,
  getGirlBySlug,
  getGirlByPermalink,
} from "../controllers/girlController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================================
   ADMIN ROUTES
========================================= */

// ADD GIRL
router.post(
  "/add",
  authMiddleware,
  addGirl
);

// UPDATE GIRL
router.put(
  "/update/:id",
  authMiddleware,
  updateGirl
);

// DELETE
router.delete(
  "/delete/:id",
  authMiddleware,
  deleteGirl
);

// STATUS
router.patch(
  "/status/:id",
  authMiddleware,
  toggleGirlStatus
);

/* =========================================
   PUBLIC ROUTES
========================================= */

// ALL GIRLS
router.get(
  "/all",
  getAllGirls
);

// CITY WISE
router.get(
  "/city/:cityId",
  getGirlsByCity
);

// SUBCITY WISE
router.get(
  "/subcity/:subCityId",
  getGirlsBySubCity
);

// DETAILS
router.get(
  "/details/:id",
  getGirlById
);

// OLD SEO
router.get(
  "/slug/:seoSlug",
  getGirlBySlug
);

/* =========================================
   MAIN SEO ROUTE
========================================= */

// ALWAYS LAST
router.get(
  "/:permalink",
  getGirlByPermalink
);

export default router;