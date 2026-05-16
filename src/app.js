import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import adminRoutes from "./routes/adminRoutes.js";
import cityRoutes from "./routes/cityRoutes.js";
import girlRoutes from "./routes/girlRoutes.js";
import stateRoutes from "./routes/stateRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import redirectRoutes from "./routes/redirectRoutes.js";
import sitemapRoutes from "./routes/sitemapRoutes.js";
import subCityRoutes from "./routes/subCityRoutes.js";
import faqRoutes from "./routes/faqRoutes.js";

dotenv.config();

const app = express();

/* ==============================
   PATH FIX
============================== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ==============================
   MIDDLEWARE
============================== */
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://girlswithwine.com",
      "https://www.girlswithwine.com",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

/* ==============================
   STATIC FILES
============================== */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ==============================
   DATABASE
============================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

/* ==============================
   TEST ROUTE
============================== */
app.get("/", (req, res) => {
  res.send("Backend Running Successfully 🚀");
});

/* ==============================
   ROUTES
============================== */

// Sitemap FIRST
app.use("/", sitemapRoutes);

// APIs
app.use("/api/admin", adminRoutes);
app.use("/api/states", stateRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/girls", girlRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/subcities", subCityRoutes);
app.use("/api/faqs", faqRoutes);

// Redirect LAST
app.use("/", redirectRoutes);

/* ==============================
   ERROR HANDLER
============================== */
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err);

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Payload too large. Reduce file size.",
    });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      message: "Uploaded file is too large.",
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong",
  });
});

export default app;
