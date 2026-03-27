import City from "../models/City.js";
import * as cheerio from "cheerio";
import axios from "axios";
import fs from "fs";
import path from "path";
import { slugify, generateCitySchema } from "../utils/seoHelper.js";

// ✅ FINAL BASE URL (NO FALLBACK ❌)
const BASE_URL =
  process.env.BASE_URL || "https://girlswithwine.com";

if (!BASE_URL) {
  console.warn("⚠️ BASE_URL missing, using fallback");
}


// ------------------------------------------------
// PROCESS DESCRIPTION IMAGES
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
// CREATE CITY
// ------------------------------------------------
export const createCity = async (req, res) => {

  try {

    const {
      mainCity,
      permalink,
      heading,
      subDescription,
      description,
      seoTitle,
      seoDescription,
      seoKeywords,
      imageAlt
    } = req.body;

    if (!mainCity || !permalink) {
      return res.status(400).json({
        message: "City name & permalink required"
      });
    }

    const normalizedCity = mainCity.trim().toLowerCase();

    const cleanCity = slugify(normalizedCity);
    const cleanPermalink = slugify(permalink.trim());

    const finalSlug = `${cleanPermalink}-${cleanCity}`.toLowerCase();

    const exists = await City.findOne({ slug: finalSlug });

    if (exists) {
      return res.status(400).json({
        message: "Page already exists"
      });
    }

    let imageUrl = "";

    const finalImageAlt =
      imageAlt || `${normalizedCity} escort service`;

    if (req.file) {
      imageUrl = `${BASE_URL}/uploads/cities/${req.file.filename}`;
    }

    const cleanDescription =
      await processDescriptionImages(description);

    const canonicalUrl = `https://girlswithwine.com/${finalSlug}`;

    const city = await City.create({
      mainCity: normalizedCity,
      permalink: cleanPermalink,
      slug: finalSlug,
      heading,
      subDescription,
      imageUrl,
      imageAlt: finalImageAlt,
      description: cleanDescription,
      seoTitle,
      seoDescription,
      seoKeywords,
      canonicalUrl
    });

    res.status(201).json({
      message: "City created",
      data: city
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }

};


// ------------------------------------------------
// GET CITY PAGE
// ------------------------------------------------
export const getCityPage = async (req, res) => {

  try {

    const { citySlug } = req.params;

    const city = await City.findOne({
      slug: citySlug,
      status: "Active"
    }).lean();

    if (!city) {
      return res.status(404).json({
        message: "City not found"
      });
    }

    const schema = generateCitySchema(city);

    res.json({
      city,
      seo: {
        title: city.seoTitle || city.heading,
        description: city.seoDescription,
        seoKeywords: city.seoKeywords,
        canonical: `https://girlswithwine.com/${city.slug}`
      },
      schema
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }

};


// ------------------------------------------------
// GET ALL CITIES
// ------------------------------------------------
export const getCities = async (req, res) => {

  try {
    const cities = await City.find().sort({ createdAt: -1 });
    res.json(cities);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }

};


// ------------------------------------------------
// UPDATE CITY
// ------------------------------------------------
export const updateCity = async (req, res) => {

  try {

    const updates = { ...req.body };

    const existing = await City.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        message: "City not found"
      });
    }

    if (updates.mainCity) {
      updates.mainCity =
        updates.mainCity.trim().toLowerCase();
    }

    if (updates.permalink || updates.mainCity) {

      const cleanCity = slugify(
        updates.mainCity || existing.mainCity
      );

      const cleanPermalink = slugify(
        (updates.permalink || existing.permalink).trim()
      );

      const finalSlug = `${cleanPermalink}-${cleanCity}`.toLowerCase();

      const exists = await City.findOne({
        slug: finalSlug,
        _id: { $ne: req.params.id }
      });

      if (exists) {
        return res.status(400).json({
          message: "Page already exists"
        });
      }

      updates.slug = finalSlug;
      updates.permalink = cleanPermalink;
      updates.canonicalUrl = `https://girlswithwine.com/${finalSlug}`;
    }

    if (updates.description) {
      updates.description =
        await processDescriptionImages(updates.description);
    }

    if (req.file) {
      updates.imageUrl =
        `${BASE_URL}/uploads/cities/${req.file.filename}`;
    }

    const updated = await City.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      message: "City updated",
      data: updated
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }

};


// ------------------------------------------------
// DELETE CITY
// ------------------------------------------------
export const deleteCity = async (req, res) => {

  try {

    const deleted = await City.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        message: "City not found"
      });
    }

    res.json({
      message: "City deleted"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }

};


// ------------------------------------------------
// UPDATE CITY IMAGE
// ------------------------------------------------
export const updateCityImage = async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({
        message: "Image required"
      });
    }

    const imageUrl =
      `${BASE_URL}/uploads/cities/${req.file.filename}`;

    const updated = await City.findByIdAndUpdate(
      req.params.id,
      { imageUrl },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        message: "City not found"
      });
    }

    res.json({
      message: "Image updated",
      data: updated
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
export const toggleCityStatus = async (req, res) => {

  try {

    const city = await City.findById(req.params.id);

    if (!city) {
      return res.status(404).json({
        message: "City not found"
      });
    }

    city.status =
      city.status === "Active"
        ? "Inactive"
        : "Active";

    await city.save();

    res.json({
      message: "City status changed",
      status: city.status
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }

};


// ------------------------------------------------
// GET CITY BY ID
// ------------------------------------------------
export const getCityById = async (req, res) => {

  try {

    const city = await City.findById(req.params.id);

    if (!city) {
      return res.status(404).json({
        message: "City not found"
      });
    }

    res.json(city);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }

};
