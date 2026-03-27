// routes/uploadRoutes.js

import express from "express";
import {
  createDynamicUploader,
  createUploader,
} from "../utils/multerUpload.js";
import {
  uploadImage,
  getImages,
} from "../controllers/uploadController.js";

const router = express.Router();

/* ===========================
   STATIC UPLOAD
=========================== */
router.post("/static/:folder", (req, res, next) => {
  const upload = createUploader(req.params.folder).single("image");

  upload(req, res, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    next();
  });
}, uploadImage);

/* ===========================
   DYNAMIC UPLOAD
=========================== */
router.post(
  "/dynamic",
  createDynamicUploader().single("image"),
  uploadImage
);

/* ===========================
   GET ALL IMAGES (DB)
=========================== */
router.get("/", getImages);

export default router;