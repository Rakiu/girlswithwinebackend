import express from "express";

import {
  addReview,
  getAllReviews,
  getReviewsByGirl,
  deleteReview,
  approveReview,
  rejectReview,
  getTopReviews,
} from "../controllers/reviewController.js";

import {
  authMiddleware,
} from "../middleware/authMiddleware.js";

const router =
  express.Router();

/* =============================
   PUBLIC
============================= */

router.post(
  "/add",
  addReview
);

router.get(
  "/girl/:girlId",
  getReviewsByGirl
);

router.get(
  "/top",
  getTopReviews
);

/* =============================
   ADMIN
============================= */

router.get(
  "/",
  authMiddleware,
  getAllReviews
);

router.patch(
  "/approve/:id",
  authMiddleware,
  approveReview
);

router.patch(
  "/reject/:id",
  authMiddleware,
  rejectReview
);

router.delete(
  "/:id",
  authMiddleware,
  deleteReview
);

export default router;