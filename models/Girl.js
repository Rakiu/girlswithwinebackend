import mongoose from "mongoose";
import slugify from "slugify";

const GirlSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    age: {
      type: Number,
      required: true,
    },

    heading: {
      type: String,
      required: true,
    },

    city: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "City",
      },
    ],

    /* 🔥 MAIN SEO FIELD */
    permalink: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    description: String,
    aboutGirlInformation: String,
    priceDetails: String,

    imageUrl: String,
    images: [String],

    imageAlt: {
      type: String,
      default: "",
    },

    seoTitle: String,
    seoDescription: String,
    seoKeywords: [String],

    phoneNumber: {
      type: String,
      required: true,
      match: [/^\+91[6-9]\d{9}$/, "Enter valid phone number"],
    },

    whatsappNumber: {
      type: String,
      match: [/^\+91[6-9]\d{9}$/, "Enter valid WhatsApp number"],
    },

    canonicalLink: String,

    showOnHomepage: {
      type: Boolean,
      default: false,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

/* =============================
   HELPERS
============================= */

const formatNumber = (num) => {
  if (!num) return "";
  return num.startsWith("+91") ? num : `+91${num}`;
};

const generateSlug = (permalink, name) => {
  const cleanPermalink = slugify(permalink || "", {
    lower: true,
    strict: true,
  });

  const cleanName = slugify(name || "", {
    lower: true,
    strict: true,
  });

  return `${cleanPermalink}-${cleanName}`;
};

/* =============================
   PRE SAVE
============================= */

GirlSchema.pre("save", async function (next) {
  try {
    // ✅ FORMAT NUMBERS
    if (this.phoneNumber) {
      this.phoneNumber = formatNumber(this.phoneNumber);
    }

    if (this.whatsappNumber) {
      this.whatsappNumber = formatNumber(this.whatsappNumber);
    }

    if (!this.whatsappNumber && this.phoneNumber) {
      this.whatsappNumber = this.phoneNumber;
    }

    // ✅ SAFETY (NULL SLUG FIX)
    if (!this.permalink && this.name) {
      this.permalink = this.name;
    }

    // ✅ SLUG GENERATE
    if (this.isModified("permalink") || this.isModified("name")) {
      let baseSlug = generateSlug(this.permalink, this.name);

      // ⚠️ fallback safety
      if (!baseSlug) {
        baseSlug = `girl-${Date.now()}`;
      }

      let finalSlug = baseSlug;
      let counter = 1;

      while (
        await mongoose.models.Girl.findOne({
          permalink: finalSlug,
          _id: { $ne: this._id },
        })
      ) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      this.permalink = finalSlug;
    }

    // ✅ CANONICAL
    if (this.permalink) {
      this.canonicalLink = `https://girlswithwine.com/${this.permalink}`;
    }

    next();
  } catch (err) {
    next(err);
  }
});

/* =============================
   PRE UPDATE
============================= */

GirlSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const update = this.getUpdate();

    if (update.permalink || update.name) {
      let baseSlug = generateSlug(
        update.permalink || "",
        update.name || ""
      );

      if (!baseSlug) {
        baseSlug = `girl-${Date.now()}`;
      }

      let finalSlug = baseSlug;
      let counter = 1;

      while (
        await mongoose.models.Girl.findOne({
          permalink: finalSlug,
          _id: { $ne: this.getQuery()._id },
        })
      ) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      update.permalink = finalSlug;
      update.canonicalLink = `https://girlswithwine.com/${finalSlug}`;
    }

    this.setUpdate(update);
    next();
  } catch (err) {
    next(err);
  }
});

/* =============================
   INDEX
============================= */

GirlSchema.index({ permalink: 1 });

export default mongoose.models.Girl || mongoose.model("Girl", GirlSchema);
