// routes/faqRoutes.js

import express from "express";

import {
  addFaq,
  getFaqs,
  getFaqsByType,
  getFaqsByCity,
  getFaqsBySubCity,
  getFaqsByGirl,
  getHomepageFaqs,
  updateFaq,
  deleteFaq,
  toggleFaqStatus,
  getFaqsByVisibility,
} from "../controllers/faqController.js";

import {
  authMiddleware,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================================================
   ADMIN ROUTES
========================================================= */

/* ===============================
   CREATE FAQ
================================ */

router.post(
  "/add",
  authMiddleware,
  addFaq
);

/* ===============================
   UPDATE FAQ
================================ */

router.put(
  "/update/:id",
  authMiddleware,
  updateFaq
);

/* ===============================
   DELETE FAQ
================================ */

router.delete(
  "/delete/:id",
  authMiddleware,
  deleteFaq
);

/* ===============================
   TOGGLE FAQ STATUS
================================ */

router.patch(
  "/status/:id",
  authMiddleware,
  toggleFaqStatus
);

/* =========================================================
   PUBLIC ROUTES
========================================================= */

/* ===============================
   GET ALL FAQ
================================ */

router.get(
  "/",
  getFaqs
);

/* =========================================================
   HOMEPAGE FAQ
========================================================= */

router.get(
  "/homepage",
  getHomepageFaqs
);

/* =========================================================
   FAQ BY TYPE
   type = homepage | city | subcity | girl
========================================================= */

router.get(
  "/type/:type",
  getFaqsByType
);

/* =========================================================
   CITY FAQ
========================================================= */

router.get(
  "/city/:cityId",
  getFaqsByCity
);

/* =========================================================
   SUBCITY FAQ
========================================================= */

router.get(
  "/subcity/:subCityId",
  getFaqsBySubCity
);

/* =========================================================
   GIRL FAQ
========================================================= */

router.get(
  "/girl/:girlId",
  getFaqsByGirl
);

router.get(
  "/visibility",
  getFaqsByVisibility
);

export default router;