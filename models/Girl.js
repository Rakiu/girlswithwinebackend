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

    // ✅ SUBCITY
    subCity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCity",
    },

    /* 🔥 MAIN SEO FIELD (CLEAN) */
    permalink: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
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

    // ✅ SOCIAL SEO (Nayi fields yahan add ki hain)
    ogTitle: String,
    ogDescription: String,
    twitterTitle: String,
    twitterDescription: String,
    facebookTitle: String,
    facebookDescription: String,

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

// 📞 phone formatter
const formatNumber = (num) => {
  if (!num) return "";
  return num.startsWith("+91") ? num : `+91${num.replace(/\D/g, "")}`;
};

// 🔥 CLEAN SLUG (ONLY PERMALINK)
const generateSlug = (permalink) => {
  return slugify(permalink || "", {
    lower: true,
    strict: true,
  });
};

/* =============================
   PRE SAVE
============================= */

GirlSchema.pre("save", async function (next) {
  try {
    // ✅ PHONE FORMAT
    if (this.phoneNumber) {
      this.phoneNumber = formatNumber(this.phoneNumber);
    }

    if (this.whatsappNumber) {
      this.whatsappNumber = formatNumber(this.whatsappNumber);
    }

    if (!this.whatsappNumber && this.phoneNumber) {
      this.whatsappNumber = this.phoneNumber;
    }

    // ✅ fallback permalink
    if (!this.permalink && this.name) {
      this.permalink = this.name;
    }

    // 🔥 GENERATE CLEAN SLUG
    if (this.isModified("permalink")) {
      let baseSlug = generateSlug(this.permalink);

      if (!baseSlug) {
        return next(new Error("Invalid permalink"));
      }

      let finalSlug = baseSlug;
      let counter = 1;

      // ✅ UNIQUE CHECK
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

    // ✅ CANONICAL LINK
    this.canonicalLink = `https://girlswithwine.com/${this.permalink}`;

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

    if (update.permalink) {
      let baseSlug = generateSlug(update.permalink);

      if (!baseSlug) {
        return next(new Error("Invalid permalink"));
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
   EXPORT
============================= */

export default mongoose.models.Girl ||
  mongoose.model("Girl", GirlSchema);