import Girl from "../models/Girl.js";
import City from "../models/City.js";
import SubCity from "../models/SubCity.js"; // ✅ ADD
import * as cheerio from "cheerio";
import axios from "axios";
import fs from "fs";
import path from "path";

/* =============================
   HELPERS
============================= */

const formatNumber = (num) => {
  if (!num) return "";
  return num.startsWith("+91") ? num : `+91${num}`;
};

const uploadDir = "uploads/girls";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const parseCity = (city) => {
  if (!city) return [];
  if (Array.isArray(city)) return city;

  if (typeof city === "string") {
    try {
      const parsed = JSON.parse(city);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [city];
    }
  }
  return [];
};

/* =============================
   IMAGE PROCESS
============================= */

const processEditorImages = async (html) => {
  if (!html) return "";

  const $ = cheerio.load(html);
  const tasks = [];

  $("img").each((_, img) => {
    const src = $(img).attr("src");
    if (!src) return;

    const fileName = Date.now() + ".png";
    const savePath = path.join(uploadDir, fileName);

    if (src.startsWith("data:image")) {
      const base64Data = src.replace(/^data:image\/\w+;base64,/, "");

      tasks.push(
        new Promise((resolve) => {
          fs.writeFileSync(savePath, Buffer.from(base64Data, "base64"));
          $(img).attr("src", `/uploads/girls/${fileName}`);
          resolve();
        })
      );
    }
  });

  await Promise.all(tasks);
  return $.html();
};

/* =============================
   ADD GIRL
============================= */

export const addGirl = async (req, res) => {
  try {
    const baseUrl =
      process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;

    let imageUrl = "";
    let images = [];

    if (req.files?.image) {
      imageUrl = `${baseUrl}/uploads/girls/${req.files.image[0].filename}`;
    }

    if (req.files?.images) {
      images = req.files.images.map(
        (file) => `${baseUrl}/uploads/girls/${file.filename}`
      );
    }

    const description = await processEditorImages(req.body.description);

    const girl = await Girl.create({
      name: req.body.name,
      age: req.body.age,
      heading: req.body.heading,

      city: parseCity(req.body.city),

      // ✅ SUBCITY ADD
      subCity: req.body.subCity || null,

      permalink: req.body.permalink || req.body.name,

      description,
      imageUrl,
      images,

      phoneNumber: formatNumber(req.body.phoneNumber),
      whatsappNumber: req.body.whatsappNumber
        ? formatNumber(req.body.whatsappNumber)
        : undefined,

      seoKeywords: req.body.seoKeywords?.split(",") || [],
      showOnHomepage: req.body.showOnHomepage === "true",
    });

    res.json({ message: "Girl created", data: girl });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =============================
   GET ALL GIRLS
============================= */

export const getAllGirls = async (req, res) => {
  try {
    const girls = await Girl.find()
      .populate("city")
      .populate("subCity") // ✅ IMPORTANT
      .sort({ createdAt: -1 });

    res.json(girls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =============================
   GET BY ID
============================= */

export const getGirlById = async (req, res) => {
  try {
    const girl = await Girl.findById(req.params.id)
      .populate("city")
      .populate("subCity");

    if (!girl) return res.status(404).json({ message: "Not found" });

    res.json(girl);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =============================
   GET BY CITY
============================= */

export const getGirlsByCity = async (req, res) => {
  try {
    const girls = await Girl.find({
      city: req.params.cityId,
      status: "Active",
    })
      .populate("city")
      .populate("subCity");

    res.json(girls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =============================
   ✅ GET BY SUBCITY (NEW)
============================= */

export const getGirlsBySubCity = async (req, res) => {
  try {
    const girls = await Girl.find({
      subCity: req.params.subCityId,
      status: "Active",
    })
      .populate("city")
      .populate("subCity");

    res.json(girls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =============================
   UPDATE GIRL
============================= */

export const updateGirl = async (req, res) => {
  try {
    const existing = await Girl.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });

    const updated = await Girl.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        age: req.body.age,
        heading: req.body.heading,
        city: parseCity(req.body.city),

        // ✅ SUBCITY UPDATE
        subCity: req.body.subCity || existing.subCity,

        permalink: req.body.permalink,
        description: req.body.description,
      },
      { new: true }
    )
      .populate("city")
      .populate("subCity");

    res.json(updated);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =============================
   DELETE
============================= */

export const deleteGirl = async (req, res) => {
  await Girl.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};

/* =============================
   STATUS
============================= */

export const toggleGirlStatus = async (req, res) => {
  const girl = await Girl.findById(req.params.id);
  girl.status = girl.status === "Active" ? "Inactive" : "Active";
  await girl.save();

  res.json(girl);
};

// =============================
// GET GIRL BY PERMALINK (SEO)
// =============================
export const getGirlByPermalink = async (req, res) => {
  try {
    const { permalink } = req.params;

    const girl = await Girl.findOne({
      permalink,
      status: "Active"
    })
      .populate("city")
      .populate("subCity");

    if (!girl) {
      return res.status(404).json({ message: "Girl not found" });
    }

    res.json(girl);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// =============================
// GET GIRL BY SLUG (OPTIONAL)
// =============================
export const getGirlBySlug = async (req, res) => {
  try {
    const { seoSlug } = req.params;

    const girl = await Girl.findOne({
      permalink: seoSlug
    })
      .populate("city")
      .populate("subCity");

    if (!girl) {
      return res.status(404).json({ message: "Girl not found" });
    }

    res.json(girl);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};