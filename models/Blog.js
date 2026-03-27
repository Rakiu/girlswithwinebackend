import mongoose from "mongoose";

/* ========================
   SLUG GENERATOR
======================== */

const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const BlogSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true,
    trim: true
  },

  slug: {
    type: String,
    unique: true
  },

  description: String,

  imageUrl: String,

  imageAlt: String,

  canonicalUrl: String,

  seoTitle: String,

  seoDescription: String,

  seoKeywords: String

}, { timestamps: true });


/* ========================
   AUTO SEO GENERATION
======================== */

BlogSchema.pre("save", function(next) {

  const baseUrl = process.env.BASE_URL || "http://localhost:5000";

  if (!this.slug && this.title) {
    this.slug = generateSlug(this.title);
  }

  if (!this.imageAlt && this.title) {
    this.imageAlt = `${this.title} image`;
  }

  if (!this.canonicalUrl && this.slug) {
    this.canonicalUrl = `${baseUrl}/${this.slug}`;
  }

  if (!this.seoTitle) {
    this.seoTitle = this.title;
  }

  next();
});

export default mongoose.model("Blog", BlogSchema);