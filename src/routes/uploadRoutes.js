// routes/uploadRoutes.js

import express from "express";

import {
  uploadImage,
  getImages,
} from "../controllers/uploadController.js";

const router =
  express.Router();

/* ===========================
   STATIC UPLOAD
=========================== */

router.post(
  "/static/:folder",
  (req, res, next) => {

    req.dynamicFolder =
      req.params.folder;

    next();
  },

  uploadImage
);

/* ===========================
   DYNAMIC UPLOAD
=========================== */

router.post(
  "/dynamic",
  uploadImage
);

/* ===========================
   GET ALL IMAGES
=========================== */

router.get(
  "/",
  getImages
);

export default router;