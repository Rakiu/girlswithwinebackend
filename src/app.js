import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";

/* =========================================
   ROUTES
========================================= */

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
   CONSTANTS
========================================= */

const CLOUDINARY_BASE =
  "https://res.cloudinary.com/dd8zulgom/image/upload";

/* =========================================
   TRUST PROXY
========================================= */

app.set(
  "trust proxy",
  1
);

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

app.use(
  express.json({
    limit: "100mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,

    limit: "100mb",
  })
);

/* =========================================
   FILE UPLOAD
========================================= */

app.use(
  fileUpload({
    useTempFiles: true,

    tempFileDir:
      "/tmp/",

    limits: {
      fileSize:
        100 *
        1024 *
        1024,
    },

    abortOnLimit:
      true,

    responseOnLimit:
      "File size too large",
  })
);

/* =========================================
   DATABASE CONNECTION
========================================= */

const connectDB =
  async () => {

    try {

      if (
        mongoose.connection
          .readyState ===
        0
      ) {

        await mongoose.connect(
          process.env
            .MONGO_URI
        );

        console.log(
          "✅ MongoDB Connected"
        );
      }

    } catch (error) {

      console.error(
        "❌ MongoDB Error:",
        error.message
      );
    }
  };

await connectDB();

/* =========================================
   CLOUDINARY IMAGE REDIRECT
   EXPRESS 5 FIXED VERSION
========================================= */

app.get(
  /^\/uploads\/(.+)/,

  async (
    req,
    res
  ) => {

    try {

      const imagePath =
        req.params[0];

      if (
        !imagePath
      ) {

        return res.status(
          404
        ).send(
          "Image not found"
        );
      }

      /* =========================================
         REMOVE EXTRA SLASH
      ========================================= */

      const cleanedPath =
        imagePath.replace(
          /^\/+/,
          ""
        );

      /* =========================================
         FINAL CLOUDINARY URL
      ========================================= */

      const cloudinaryUrl =
        `${CLOUDINARY_BASE}/${cleanedPath}`;

      console.log(
        "➡ Redirecting:",
        cloudinaryUrl
      );

      /* =========================================
         301 REDIRECT
      ========================================= */

      return res.redirect(
        301,
        cloudinaryUrl
      );

    } catch (error) {

      console.log(
        "❌ UPLOAD REDIRECT ERROR:",
        error
      );

      return res.status(
        500
      ).send(
        "Redirect failed"
      );
    }
  }
);

/* =========================================
   TEST ROUTES
========================================= */

app.get(
  "/",

  (
    req,
    res
  ) => {

    res.send(
      "Backend Working 🚀"
    );
  }
);

app.get(
  "/test",

  (
    req,
    res
  ) => {

    res.status(200).json({
      success: true,

      message:
        "Backend Working 🚀",
    });
  }
);

/* =========================================
   ROUTES
========================================= */

/* SITEMAP FIRST */

app.use(
  "/",
  sitemapRoutes
);

/* APIs */

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/states",
  stateRoutes
);

app.use(
  "/api/cities",
  cityRoutes
);

app.use(
  "/api/girls",
  girlRoutes
);

app.use(
  "/api/reviews",
  reviewRoutes
);

app.use(
  "/api/contact",
  contactRoutes
);

app.use(
  "/api/blogs",
  blogRoutes
);

app.use(
  "/api/upload",
  uploadRoutes
);

app.use(
  "/api/subcities",
  subCityRoutes
);

app.use(
  "/api/faqs",
  faqRoutes
);

/* REDIRECT LAST */

app.use(
  "/",
  redirectRoutes
);

/* =========================================
   404 HANDLER
========================================= */

app.use(
  (
    req,
    res
  ) => {

    res.status(404).json({
      success: false,

      message:
        "Route Not Found",
    });
  }
);

/* =========================================
   ERROR HANDLER
========================================= */

app.use(
  (
    err,
    req,
    res,
    next
  ) => {

    console.error(
      "❌ SERVER ERROR:",
      err
    );

    /* =========================================
       PAYLOAD TOO LARGE
    ========================================= */

    if (
      err.type ===
      "entity.too.large"
    ) {

      return res.status(
        413
      ).json({
        success: false,

        message:
          "Payload too large",
      });
    }

    /* =========================================
       MONGODB VALIDATION
    ========================================= */

    if (
      err.name ===
      "ValidationError"
    ) {

      return res.status(
        400
      ).json({
        success: false,

        message:
          Object.values(
            err.errors
          )
            .map(
              (
                e
              ) =>
                e.message
            )
            .join(", "),
      });
    }

    /* =========================================
       INVALID ID
    ========================================= */

    if (
      err.name ===
      "CastError"
    ) {

      return res.status(
        400
      ).json({
        success: false,

        message:
          "Invalid ID",
      });
    }

    /* =========================================
       CLOUDINARY ERROR
    ========================================= */

    if (
      err.http_code
    ) {

      return res.status(
        400
      ).json({
        success: false,

        message:
          err.message,
      });
    }

    /* =========================================
       DEFAULT ERROR
    ========================================= */

    return res.status(
      err.status ||
        500
    ).json({
      success: false,

      message:
        err.message ||
        "Internal Server Error",
    });
  }
);

/* =========================================
   EXPORT APP
========================================= */

export default app;