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
 // 🔥 NEW

dotenv.config();

const app = express();

/* ==============================
   PATH FIX (ES MODULE SUPPORT)
============================== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ==============================
   MIDDLEWARE
============================== */

// Enable CORS
app.use(cors());

// Increase payload limit
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

/* ==============================
   STATIC FILES (🔥 IMPORTANT)
============================== */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ==============================
   DATABASE CONNECTION
============================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

/* ==============================
   HEALTH CHECK
============================== */
app.get("/", (req, res) => {
  res.send("Backend Running Successfully 🚀");
});

/* ==============================
   API ROUTES
============================== */
app.use("/api/admin", adminRoutes);
app.use("/api/states", stateRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/girls", girlRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/", redirectRoutes);
/* 🔥 NEW UPLOAD ROUTE */
app.use("/api/upload", uploadRoutes);

/* ==============================
   GLOBAL ERROR HANDLER
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

/* ==============================
   SERVER START
============================== */
const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.BASE_URL;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API URL: ${BASE_URL}`);
  console.log(`📂 Upload Base URL: ${BASE_URL}/uploads`);
});




