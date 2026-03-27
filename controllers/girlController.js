import Girl from "../models/Girl.js";
import City from "../models/City.js"; // ✅ ADD
import slugify from "slugify"; 
import * as cheerio from "cheerio";
import axios from "axios";
import fs from "fs";
import path from "path";


const formatNumber = (num) => {
  if (!num) return "";
  return num.startsWith("+91") ? num : `+91${num}`;
};

/* =============================
   ENSURE UPLOAD DIRECTORY
============================= */

const uploadDir = "uploads/girls";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* =============================
   SAFE CITY PARSER
============================= */

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
   PROCESS EDITOR IMAGES
============================= */

const processEditorImages = async (html) => {
  if (!html) return "";

  try {
    const $ = cheerio.load(html);
    const tasks = [];

    $("img").each((_, img) => {
      const src = $(img).attr("src");
      if (!src) return;

      const fileName =
        Date.now() + "-" + Math.random().toString(36).slice(2) + ".png";

      const savePath = path.join(uploadDir, fileName);

      /* BASE64 IMAGE */

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

      /* EXTERNAL IMAGE */

      else if (src.startsWith("http")) {
        tasks.push(
          axios({
            url: src,
            method: "GET",
            responseType: "arraybuffer",
          })
            .then((response) => {
              fs.writeFileSync(savePath, response.data);
              $(img).attr("src", `/uploads/girls/${fileName}`);
            })
            .catch(() => { })
        );
      }
    });

    await Promise.all(tasks);

    return $.html();
  } catch (error) {
    console.error("Editor processing error:", error);
    return html;
  }
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

    const citiesArray = parseCity(req.body.city);

// ✅ OPTIONAL CITY
const finalCity = citiesArray.length ? citiesArray : [];

    const description = await processEditorImages(req.body.description);

    const girl = await Girl.create({
  name: req.body.name,
  age: req.body.age,
  heading: req.body.heading,

  city: finalCity, // ✅ now optional

   permalink: req.body.permalink || req.body.name || `girl-${Date.now()}`,


  description,
  aboutGirlInformation: req.body.aboutGirlInformation,
  priceDetails: req.body.priceDetails,

  imageUrl,
  images,
  imageAlt: req.body.imageAlt || "",

  phoneNumber: formatNumber(req.body.phoneNumber),
  whatsappNumber: req.body.whatsappNumber
    ? formatNumber(req.body.whatsappNumber)
    : undefined,

  seoTitle: req.body.seoTitle || "",
  seoDescription: req.body.seoDescription || "",
  seoKeywords: req.body.seoKeywords
    ? req.body.seoKeywords.split(",")
    : [],

  showOnHomepage: req.body.showOnHomepage === "true",
  status: "Active",
});

    res.json({
      message: "Girl created",
      data: girl,
    });

  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message });
  }
};
/* =============================
   GET ALL GIRLS (PAGINATION)
============================= */

export const getAllGirls = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const totalGirls = await Girl.countDocuments();

    const girls = await Girl.find()
      .populate({
        path: "city",

      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: girls,
      pagination: {
        total: totalGirls,
        page,
        limit,
        totalPages: Math.ceil(totalGirls / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =============================
   GET SINGLE GIRL
============================= */

export const getGirlById = async (req, res) => {
  try {
    const girl = await Girl.findById(req.params.id).populate({
      path: "city",

    });

    if (!girl) {
      return res.status(404).json({ message: "Girl not found" });
    }

    res.json(girl);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =============================
   CITY-WISE GIRLS
============================= */

export const getGirlsByCity = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const totalGirls = await Girl.countDocuments({
      city: req.params.cityId,
      status: "Active",
    });

    const girls = await Girl.find({
      city: req.params.cityId,
      status: "Active",
    })
      .populate({
        path: "city",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: girls,
      pagination: {
        total: totalGirls,
        page,
        limit,
        totalPages: Math.ceil(totalGirls / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =============================
   DELETE GIRL
============================= */

export const deleteGirl = async (req, res) => {
  try {
    await Girl.findByIdAndDelete(req.params.id);

    res.json({
      message: "Girl deleted",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =============================
   TOGGLE STATUS
============================= */

export const toggleGirlStatus = async (req, res) => {
  try {
    const girl = await Girl.findById(req.params.id);

    if (!girl) {
      return res.status(404).json({ message: "Girl not found" });
    }

    girl.status = girl.status === "Active" ? "Inactive" : "Active";

    await girl.save();

    res.json({
      message: "Status updated",
      status: girl.status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =============================
   UPDATE GIRL
============================= */
export const updateGirl = async (req, res) => {
  try {

    const baseUrl =
      process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;

    const citiesArray = parseCity(req.body.city);

    const existing = await Girl.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: "Girl not found" });
    }

    const data = {
      name: req.body.name,
      age: req.body.age,
      heading: req.body.heading,
      city: citiesArray,

      // ✅ RAW PERMALINK (MODEL HANDLE KAREGA)
      permalink: req.body.permalink || existing.permalink,

      description: req.body.description,
      aboutGirlInformation: req.body.aboutGirlInformation,
      priceDetails: req.body.priceDetails,

      phoneNumber: formatNumber(req.body.phoneNumber),
      whatsappNumber: req.body.whatsappNumber
        ? formatNumber(req.body.whatsappNumber)
        : undefined,

      seoTitle: req.body.seoTitle,
      seoDescription: req.body.seoDescription,
      seoKeywords: req.body.seoKeywords
        ? req.body.seoKeywords.split(",")
        : [],

      showOnHomepage: req.body.showOnHomepage === "true",
    };

    if (req.files?.image) {
      data.imageUrl = `${baseUrl}/uploads/girls/${req.files.image[0].filename}`;
    }

    if (req.files?.images) {
      data.images = req.files.images.map(
        (file) => `${baseUrl}/uploads/girls/${file.filename}`
      );
    }

    const updatedGirl = await Girl.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    ).populate("city");

    res.json({
      message: "Girl updated",
      data: updatedGirl,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =============================
   GET GIRL BY SLUG
============================= */

export const getGirlBySlug = async (req, res) => {
  try {
    const { seoSlug } = req.params;

    const girl = await Girl.findOne({
      seoSlug: seoSlug,
      status: "Active",
    }).populate({
      path: "city",
    });

    if (!girl) {
      return res.status(404).json({ message: "Girl not found" });
    }

    res.json(girl);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getGirlByPermalink = async (req, res) => {
  try {
    const { permalink } = req.params;

    const girl = await Girl.findOne({
      permalink,
      status: "Active",
    }).populate("city");

    if (!girl) {
      return res.status(404).json({
        message: "Girl not found",
      });
    }

    res.json(girl);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};