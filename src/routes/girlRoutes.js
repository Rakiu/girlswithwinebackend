import express from "express";

import {
  addGirl,
  getGirlsByCity,
  getGirlsBySubCity,   // ✅ NEW
  deleteGirl,
  toggleGirlStatus,
  getAllGirls,
  updateGirl,
  getGirlById,
  getGirlBySlug,
  getGirlByPermalink
} from "../controllers/girlController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { createUploader } from "../utils/multerUpload.js";

const router = express.Router();

/* =============================
   MULTER
============================= */
const girlUpload = createUploader("girls");


/* =============================
   ADMIN ROUTES
============================= */

router.post(
  "/add",
  authMiddleware,
  girlUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 10 }
  ]),
  addGirl
);

router.put(
  "/update/:id", // ✅ better naming
  authMiddleware,
  girlUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 10 }
  ]),
  updateGirl
);

router.delete("/delete/:id", authMiddleware, deleteGirl);

router.patch("/status/:id", authMiddleware, toggleGirlStatus);


/* =============================
   PUBLIC ROUTES
============================= */

// ✅ 1. All girls
router.get("/all", getAllGirls);

// ✅ 2. City wise
router.get("/city/:cityId", getGirlsByCity);

// ✅ 3. SubCity wise (🔥 NEW)
router.get("/subcity/:subCityId", getGirlsBySubCity);

// ✅ 4. By ID (admin/debug)
router.get("/details/:id", getGirlById);

// ✅ 5. Old SEO (optional)
router.get("/slug/:seoSlug", getGirlBySlug);


/* ====================================================
   🔥 MAIN SEO ROUTE (ALWAYS LAST)
==================================================== */

router.get("/:permalink", getGirlByPermalink);

export default router;
