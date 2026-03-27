import express from "express";

import {
  addBlog,
  getBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog
} from "../controllers/blogController.js";

import { createUploader } from "../utils/multerUpload.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/* =============================
   MULTER UPLOADER
============================= */

const upload = createUploader("blogs");


/* =============================
   PUBLIC ROUTES
============================= */

/* GET ALL BLOGS */

router.get(
  "/list",
  getBlogs
);


/* =============================
   ADMIN ROUTES
============================= */

/* ADD BLOG */

router.post(
  "/add",
  authMiddleware,
  upload.single("image"),
  addBlog
);


/* UPDATE BLOG */

router.put(
  "/update/:id",
  authMiddleware,
  upload.single("image"),
  updateBlog
);


/* DELETE BLOG */

router.delete(
  "/delete/:id",
  authMiddleware,
  deleteBlog
);


/* =============================
   SEO BLOG PAGE (ALWAYS LAST)
============================= */

router.get(
  "/:slug",
  getBlogBySlug
);


export default router;