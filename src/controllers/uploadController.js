import Image from "../models/Image.js";

import cloudinary from "../config/cloudinary.js";

import {
  generateFileName,
} from "../utils/generateFileName.js";

/* ===========================
   UPLOAD IMAGE
=========================== */

export const uploadImage =
  async (req, res) => {

    try {

      /* =========================================
         CHECK FILE
      ========================================= */

      if (
        !req.files ||
        !req.files.image
      ) {

        return res.status(
          400
        ).json({
          success: false,

          message:
            "No file uploaded",
        });
      }

      const file =
        req.files.image;

      /* =========================================
         FOLDER
      ========================================= */

      const folder =
        req.dynamicFolder ||
        "gallery";

      /* =========================================
         SEO FILE NAME
      ========================================= */

      const seoFileName =
        `${generateFileName(
          file.name ||
          "image"
        )}-${Date.now()}`;

      /* =========================================
         CLOUDINARY UPLOAD
      ========================================= */

      const uploadedImage =
        await cloudinary.uploader.upload(
          file.tempFilePath,
          {
            folder:
              `uploads/${folder}`,

            public_id:
              seoFileName,

            overwrite:
              true,

            resource_type:
              "image",
          }
        );

      /* =========================================
         SAVE DB
      ========================================= */

      const savedImage =
        await Image.create({
          url:
            uploadedImage.secure_url,
        });

      return res.status(
        200
      ).json({
        success: true,

        url:
          uploadedImage.secure_url,

        data: savedImage,
      });

    } catch (error) {

      console.log(error);

      return res.status(
        500
      ).json({
        success: false,

        message:
          "Upload failed",
      });
    }
  };

/* ===========================
   GET ALL IMAGES
=========================== */

export const getImages =
  async (req, res) => {

    try {

      const images =
        await Image.find()

          .sort({
            createdAt: -1,
          });

      res.json({
        success: true,

        images,
      });

    } catch (error) {

      res.status(500).json({
        success: false,
      });
    }
  };