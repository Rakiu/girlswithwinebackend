import mongoose from "mongoose";

/* ================= FAQ ITEM SCHEMA ================= */

const faqItemSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    answer: {
      type: String,
      required: true,
      trim: true,
    },

    /* =================================================
       PAGE VISIBILITY SYSTEM
       Admin select karega kaha show karna hai
    ================================================= */

    showOn: {
      homepage: {
        type: Boolean,
        default: false,
      },

      city: {
        type: Boolean,
        default: false,
      },

      subcity: {
        type: Boolean,
        default: false,
      },

      girl: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    _id: true,
  }
);

/* ================= MAIN FAQ SCHEMA ================= */

const FaqSchema = new mongoose.Schema(
  {
    // faq list
    faqs: {
      type: [faqItemSchema],
      default: [],
    },

    /* =========================================
       FAQ TYPE
    ========================================= */

    type: {
      type: String,
      enum: [
        "homepage",
        "city",
        "subcity",
        "girl",
      ],
      required: true,
    },

    /* =========================================
       CITY FAQ
    ========================================= */

    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      default: null,
    },

    /* =========================================
       SUBCITY FAQ
    ========================================= */

    subCity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCity",
      default: null,
    },

    /* =========================================
       GIRL FAQ
    ========================================= */

    girl: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Girl",
      default: null,
    },

    /* =========================================
       STATUS
    ========================================= */

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

/* =================================================
   EXPORT MODEL
================================================= */

export default mongoose.models.Faq ||
  mongoose.model("Faq", FaqSchema);
