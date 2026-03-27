import Image from "../models/Image.js";

const BASE_URL =
  process.env.BASE_URL || "https://girlswithwine.com";

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const folder =
      req.dynamicFolder ||
      req.file.destination.split("/").pop();

    // 🔥 FINAL BASE_URL FIX
    const imageUrl = `${BASE_URL}/uploads/${folder}/${req.file.filename}`;

    const savedImage = await Image.create({
      url: imageUrl,
    });

    return res.status(200).json({
      success: true,
      url: imageUrl,
      data: savedImage,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Upload failed",
    });
  }
};

/* ===========================
   GET ALL IMAGES (DB se)
=========================== */
export const getImages = async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      images,
    });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};
