import SubCity from "../models/SubCity.js";
import City from "../models/City.js";
import * as cheerio from "cheerio";
import axios from "axios";
import fs from "fs";
import path from "path";
import { slugify } from "../utils/seoHelper.js";

const BASE_URL =
  process.env.BASE_URL || "https://girlswithwine.com";


// ------------------------------------------------
// PROCESS DESCRIPTION IMAGES (SAME)
// ------------------------------------------------
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
            `desc-${Date.now()}-${Math.floor(Math.random() * 9999)}.png`;

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


// ------------------------------------------------
// CREATE SUBCITY
// ------------------------------------------------
export const createSubCity = async (req, res) => {
  try {
    const {
      name,
      cityId,
      permalink,
      heading,
      subDescription,
      description,
      seoTitle,
      seoDescription,
      seoKeywords,
      // ✅ Nayi Social SEO Fields
      ogTitle,
      ogDescription,
      twitterTitle,
      twitterDescription,
      facebookTitle,
      facebookDescription,
      tags,
      imageAlt
    } = req.body;

    if (!name || !permalink || !cityId) {
      return res.status(400).json({
        message: "Name, City & permalink required"
      });
    }

    const normalizedName = name.trim().toLowerCase();
    const cleanName = slugify(normalizedName);
    const cleanPermalink = slugify(permalink.trim());
    const finalSlug = `${cleanPermalink}-${cleanName}`;

    // Duplicate check
    const exists = await SubCity.findOne({ slug: finalSlug });
    if (exists) {
      return res.status(400).json({ message: "SubCity page already exists" });
    }

    // TAGS FIX (Frontend se string aati hai)
    const parsedTags =
      typeof tags === "string"
        ? tags.split(",").map(t => t.trim().toLowerCase())
        : tags;

    let imageUrl = "";
    const finalImageAlt = imageAlt || `${normalizedName} escort service`;

    if (req.file) {
      imageUrl = `${BASE_URL}/uploads/subcities/${req.file.filename}`;
    }

    const cleanDescription = await processDescriptionImages(description);
    const canonicalUrl = `https://girlswithwine.com/${finalSlug}`;

    const subCity = await SubCity.create({
      name: normalizedName,
      city: cityId,
      permalink: cleanPermalink,
      slug: finalSlug,
      heading,
      subDescription,
      description: cleanDescription,
      seoTitle,
      seoDescription,
      seoKeywords,
      // ✅ Inhe database mein save kar rahe hain
      ogTitle,
      ogDescription,
      twitterTitle,
      twitterDescription,
      facebookTitle,
      facebookDescription,
      tags: parsedTags,
      imageUrl,
      imageAlt: finalImageAlt,
      canonicalUrl
    });

    // 🔥 LINK WITH CITY
    await City.findByIdAndUpdate(cityId, {
      $push: { subCities: subCity._id }
    });

    res.status(201).json({
      message: "SubCity created",
      data: subCity
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------------------------------------
// UPDATE SUBCITY
// ------------------------------------------------
export const updateSubCity = async (req, res) => {
  try {
    const updates = { ...req.body };
    const existing = await SubCity.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: "SubCity not found" });
    }

    if (updates.name) {
      updates.name = updates.name.trim().toLowerCase();
    }

    // Slug aur Canonical refresh logic
    if (updates.permalink || updates.name) {
      const cleanName = slugify(updates.name || existing.name);
      const cleanPermalink = slugify((updates.permalink || existing.permalink).trim());
      const finalSlug = `${cleanPermalink}-${cleanName}`;

      const exists = await SubCity.findOne({
        slug: finalSlug,
        _id: { $ne: req.params.id }
      });

      if (exists) {
        return res.status(400).json({ message: "Page already exists" });
      }

      updates.slug = finalSlug;
      updates.permalink = cleanPermalink;
      updates.canonicalUrl = `https://girlswithwine.com/${finalSlug}`;
    }

    // TAGS FIX (Array conversion)
    if (updates.tags && typeof updates.tags === "string") {
      updates.tags = updates.tags
        .split(",")
        .map(t => t.trim().toLowerCase());
    }

    if (updates.description) {
      updates.description = await processDescriptionImages(updates.description);
    }

    if (req.file) {
      updates.imageUrl = `${BASE_URL}/uploads/subcities/${req.file.filename}`;
    }

    // ✅ findByIdAndUpdate updates object ke throw saari social fields 
    // (ogTitle, twitterTitle, etc.) ko update kar dega.
    const updated = await SubCity.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      message: "SubCity updated",
      data: updated
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ------------------------------------------------
// GET SUBCITY PAGE
// ------------------------------------------------
export const getSubCityPage = async (req, res) => {

  try {

    const { subCitySlug } = req.params;

    const subCity = await SubCity.findOne({
      slug: subCitySlug,
      status: "Active"
    }).populate("city").lean();

    if (!subCity) {
      return res.status(404).json({
        message: "SubCity not found"
      });
    }

    res.json({
      subCity,
      seo: {
        title: subCity.seoTitle || subCity.heading,
        description: subCity.seoDescription,
        keywords: subCity.seoKeywords,
        canonical: `https://girlswithwine.com/${subCity.slug}`
      }
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }

};


// ------------------------------------------------
// GET ALL SUBCITIES
// ------------------------------------------------
export const getSubCities = async (req, res) => {

  try {
    const data = await SubCity.find()
      .populate("city")
      .sort({ createdAt: -1 });

    res.json(data);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }

};





// ------------------------------------------------
// DELETE SUBCITY
// ------------------------------------------------
export const deleteSubCity = async (req, res) => {

  try {

    const deleted = await SubCity.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        message: "SubCity not found"
      });
    }

    // REMOVE FROM CITY
    await City.findByIdAndUpdate(deleted.city, {
      $pull: { subCities: deleted._id }
    });

    res.json({
      message: "SubCity deleted"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }

};


// ------------------------------------------------
// TOGGLE STATUS
// ------------------------------------------------
export const toggleSubCityStatus = async (req, res) => {

  try {

    const subCity = await SubCity.findById(req.params.id);

    if (!subCity) {
      return res.status(404).json({
        message: "SubCity not found"
      });
    }

    subCity.status =
      subCity.status === "Active"
        ? "Inactive"
        : "Active";

    await subCity.save();

    res.json({
      message: "SubCity status changed",
      status: subCity.status
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }

};


// ------------------------------------------------
// GET BY ID
// ------------------------------------------------
export const getSubCityById = async (req, res) => {

  try {

    const data = await SubCity.findById(req.params.id).populate("city");

    if (!data) {
      return res.status(404).json({
        message: "SubCity not found"
      });
    }

    res.json(data);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }

};

// ------------------------------------------------
// GET SUBCITIES BY CITY
// ------------------------------------------------
export const getSubCitiesByCity = async (req, res) => {

  try {

    const { cityId } = req.params;

    const data = await SubCity.find({
      city: cityId,
      status: "Active"
    }).sort({ createdAt: -1 });

    res.json(data);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }

};