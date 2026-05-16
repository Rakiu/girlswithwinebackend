import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// ROUTES
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
import subCityRoutes from "./routes/subcityRoutes.js";
import faqRoutes from "./routes/faqRoutes.js";

dotenv.config();

const app = express();

/* =========================================
   CORS
========================================= */
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

/* =========================================
   BODY PARSER
========================================= */
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

/* =========================================
   DATABASE CONNECTION
========================================= */
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);

      console.log("✅ MongoDB Connected");
    }
  } catch (error) {
    console.error("❌ MongoDB Error:", error.message);
  }
};

await connectDB();

/* =========================================
   TEST ROUTES
========================================= */
app.get("/", (req, res) => {
  res.send("Backend Working 🚀");
});



app.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend Working 🚀",
  });
});

/* =========================================
   ROUTES
========================================= */

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

/* =========================================
   404 HANDLER
========================================= */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

/* =========================================
   ERROR HANDLER
========================================= */
app.use((err, req, res, next) => {
  console.error("❌ SERVER ERROR:", err);

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Payload too large",
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* =========================================
   EXPORT APP
========================================= */
export default app;