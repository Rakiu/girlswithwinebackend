import Blog from "../models/Blog.js";
import * as cheerio from "cheerio";
import axios from "axios";
import fs from "fs";
import path from "path";

const BASE_URL =
  process.env.BASE_URL || "https://girlswithwine.com";

/* =============================
   SLUG GENERATOR
============================= */

const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};


/* =============================
   PROCESS DESCRIPTION IMAGES
============================= */

export const processDescriptionImages = async (description) => {

  if (!description) return "";

  try {

    const $ = cheerio.load(description);

    const folder = "uploads/description";

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    const tasks = [];

    $("img").each((_, img) => {

      const src = $(img).attr("src");

      if (!src) return;

      if (src.includes("/uploads/description")) return;

      tasks.push(

        axios({
          url: src,
          method: "GET",
          responseType: "arraybuffer",
          timeout: 15000
        })
        .then(response => {

          const fileName =
            `blog-desc-${Date.now()}-${Math.floor(Math.random()*9999)}.png`;

          const filePath = path.join(folder, fileName);

          fs.writeFileSync(filePath, response.data);

          $(img).attr(
            "src",
            `${BASE_URL}/uploads/description/${fileName}`
          );

        })
        .catch(() => {})

      );

    });

    await Promise.all(tasks);

    return $.html();

  } catch (error) {

    console.error("Description image error:", error);

    return description;

  }

};


/* =============================
   ADD BLOG
============================= */

export const addBlog = async (req, res) => {

  try {

    const {
      title,
      description,
      seoTitle,
      seoDescription,
      seoKeywords,
      imageAlt
    } = req.body;

    if (!title)
      return res.status(400).json({
        message: "Title required"
      });

    const slug = generateSlug(title);

    const exists = await Blog.findOne({ slug });

    if (exists)
      return res.status(400).json({
        message: "Blog already exists"
      });

    let imageUrl = "";

    if (req.file) {

      imageUrl =
        `https://api4.girlswithwine.in/uploads/blogs/${req.file.filename}`;

    }

    const finalImageAlt =
      imageAlt || `${title} blog image`;

    /* PROCESS DESCRIPTION HTML */

    const cleanDescription =
      await processDescriptionImages(description);

    const canonicalUrl =
      `https://girlswithwine.com/blog/${slug}`;

    const blog = await Blog.create({

      title,
      slug,

      description: cleanDescription,

      imageUrl,
      imageAlt: finalImageAlt,

      seoTitle: seoTitle || title,
      seoDescription,
      seoKeywords,

      canonicalUrl

    });

    res.status(201).json({
      success: true,
      message: "Blog created",
      data: blog
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: error.message
    });

  }

};

/* =============================
   GET ALL BLOGS
============================= */

export const getBlogs = async (req, res) => {

  try {

    const blogs = await Blog.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: blogs
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


/* =============================
   GET BLOG BY SLUG
============================= */

export const getBlogBySlug = async (req, res) => {

  try {

    const blog = await Blog.findOne({
      slug: req.params.slug
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

    res.json({
      success: true,
      data: blog
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


/* =============================
   UPDATE BLOG
============================= */

export const updateBlog = async (req, res) => {

  try {

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

    blog.title = req.body.title || blog.title;

    /* HTML DESCRIPTION UPDATE */
    blog.description = req.body.description || blog.description;

    blog.seoTitle = req.body.seoTitle || blog.seoTitle;
    blog.seoDescription = req.body.seoDescription || blog.seoDescription;
    blog.seoKeywords = req.body.seoKeywords || blog.seoKeywords;

    if (req.file) {
      blog.imageUrl = req.file.path;
    }

    /* TITLE CHANGE -> UPDATE SEO */

    if (req.body.title) {

      const slug = generateSlug(req.body.title);

      blog.slug = slug;

      const baseUrl = process.env.BASE_URL || "http://girlwithwine.com";

      blog.canonicalUrl = `https://girlswithwine.com/blog/${slug}`;

      blog.imageAlt = `${req.body.title} image`;
    }

    await blog.save();

    res.json({
      success: true,
      message: "Blog updated successfully",
      data: blog
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


/* =============================
   DELETE BLOG
============================= */

export const deleteBlog = async (req, res) => {

  try {

    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

    res.json({
      success: true,
      message: "Blog deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};
