import express from "express";

import {
  generateSitemap,
  generatePageSitemap,
  generateCitySitemap,
  generateSubCitySitemap,
  generateProfileSitemap,
  generatePostSitemap
} from "../controllers/sitemapController.js";

const router = express.Router();

router.get("/sitemap.xml", generateSitemap);

router.get("/page-sitemap.xml", generatePageSitemap);

router.get("/city-sitemap.xml", generateCitySitemap);

router.get("/subcity-sitemap.xml", generateSubCitySitemap);

router.get("/profile-sitemap.xml", generateProfileSitemap);

router.get("/post-sitemap.xml", generatePostSitemap);

export default router;