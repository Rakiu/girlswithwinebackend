import mongoose from "mongoose";
import { slugify } from "../utils/seoHelper.js";

const SubCitySchema = new mongoose.Schema({

  city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "City",
    required: true
  },

  name: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },

  permalink: {
    type: String,
    required: true,
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

  // ✅ TAGS
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],

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

}, { timestamps: true });


// 🔥 BEFORE SAVE
SubCitySchema.pre("save", function(next){

  if (this.permalink) {
    this.permalink = slugify(this.permalink);
  }

  if (this.permalink && this.name) {
    this.slug = `${this.permalink}`;
  }

  if (!this.imageAlt && this.name) {
    this.imageAlt = `${this.name} escort service`;
  }

  if (this.slug) {
    this.canonicalUrl = `https://girlswithwine.com/${this.slug}`;
  }

  next();
});


// 🔥 BEFORE UPDATE
SubCitySchema.pre("findOneAndUpdate", function(next){

  const update = this.getUpdate();

  if (update.permalink) {
    update.permalink = slugify(update.permalink);
  }

  if (update.permalink && update.name) {
    update.slug = `${update.permalink}`;
    update.canonicalUrl = `https://girlswithwine.com/${update.slug}`;
  }

  if (update.tags && typeof update.tags === "string") {
    update.tags = update.tags.split(",").map(t => t.trim().toLowerCase());
  }

  this.setUpdate(update);
  next();
});

// duplicate prevent
SubCitySchema.index({ name: 1, city: 1 }, { unique: true });

export default mongoose.models.SubCity || mongoose.model("SubCity", SubCitySchema);