import express from "express";

import {
  addReview,
  getAllReviews,
  getReviewsByGirl,
  deleteReview,
  approveReview,
  rejectReview,
  getTopReviews
} from "../controllers/reviewController.js";

import { createUploader } from "../utils/multerUpload.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

const reviewUpload = createUploader("reviews");

/* -----------------------------
   PUBLIC
----------------------------- */

router.post(
  "/add",
  reviewUpload.single("userImage"),
  addReview
);

router.get("/girl/:girlId", getReviewsByGirl);


/* -----------------------------
   ADMIN
----------------------------- */

router.get("/", authMiddleware, getAllReviews);

router.patch("/approve/:id", authMiddleware, approveReview);

router.patch("/reject/:id", authMiddleware, rejectReview);

router.delete("/:id", authMiddleware, deleteReview);

router.get("/top", getTopReviews);

export default router;