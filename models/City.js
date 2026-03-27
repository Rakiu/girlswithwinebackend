import mongoose from "mongoose";
import { slugify } from "../utils/seoHelper.js";

const CitySchema = new mongoose.Schema(
{
  mainCity: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  permalink: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  slug: {
    type: String,
    unique: true
  },

  heading: String,
  subDescription: String,
  description: String,

  seoTitle: String,
  seoDescription: String,
  seoKeywords: String,

  canonicalUrl: String,

  schemaType: {
    type: String,
    default: "LocalBusiness"
  },

  imageUrl: String,

  imageAlt: {
    type: String,
    default: ""
  },

  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active"
  }

},{ timestamps: true });


// 🔥 BEFORE SAVE
CitySchema.pre("save", function(next){

  // permalink clean
  if (this.permalink) {
    this.permalink = slugify(this.permalink);
  }

  // image alt auto
  if (!this.imageAlt && this.mainCity) {
    this.imageAlt = `${this.mainCity} escort service`;
  }

  // canonical auto
  if (this.slug) {
    this.canonicalUrl = `https://girlswithwine.com/${this.slug}`;
  }

  next();
});


// 🔥 BEFORE UPDATE
CitySchema.pre("findOneAndUpdate", function(next){

  const update = this.getUpdate();

  if (update.permalink) {
    update.permalink = slugify(update.permalink);
  }

  this.setUpdate(update);
  next();
});


// ✅ SAFE EXPORT (VERY IMPORTANT)
export default mongoose.models.City || mongoose.model("City", CitySchema);