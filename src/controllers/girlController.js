import Girl from "../models/Girl.js";
import City from "../models/City.js";
import SubCity from "../models/SubCity.js";

import * as cheerio from "cheerio";
import cloudinary from "../config/cloudinary.js";

import {
  convertCloudinaryUrl,
} from "../utils/cloudinaryUrl.js";

/* =============================
   HELPERS
============================= */

const formatNumber = (num) => {

  if (!num) return "";

  return num.startsWith("+91")
    ? num
    : `+91${num}`;
};

/* =========================================
   PARSE CITY
========================================= */

const parseCity = (city) => {

  if (!city) return [];

  if (Array.isArray(city)) {
    return city;
  }

  if (typeof city === "string") {

    try {

      const parsed =
        JSON.parse(city);

      return Array.isArray(parsed)
        ? parsed
        : [parsed];

    } catch {

      return [city];
    }
  }

  return [];
};

/* =========================================
   PROCESS EDITOR IMAGES
========================================= */

const processEditorImages =
  async (html) => {

    if (!html) return "";

    const $ =
      cheerio.load(html);

    const tasks = [];

    $("img").each(
      (_, img) => {

        const src =
          $(img).attr("src");

        if (!src) return;

        // already processed
        if (
          src.includes(
            "girlswithwine.com/uploads/"
          )
        ) {
          return;
        }

        // BASE64 IMAGE
        if (
          src.startsWith(
            "data:image"
          )
        ) {

          tasks.push(

            cloudinary.uploader

              .upload(src, {
                folder:
                  "girls/editor",
              })

              .then(
                (
                  uploaded
                ) => {

                  $(img).attr(
                    "src",

                    convertCloudinaryUrl(
                      uploaded.secure_url
                    )
                  );
                }
              )

              .catch(
                (error) => {

                  console.log(
                    "EDITOR IMAGE ERROR =>",
                    error.message
                  );
                }
              )
          );
        }
      }
    );

    await Promise.all(
      tasks
    );

    return $.html();
  };

/* =========================================
   ADD GIRL
========================================= */

export const addGirl =
  async (req, res) => {

    try {

      console.log(
        "BODY =>",
        req.body
      );

      console.log(
        "FILES =>",
        req.files
      );

      let imageUrl = "";

      let images = [];

      /* =========================================
         SINGLE IMAGE
      ========================================= */

      if (
        req.files &&
        req.files.image
      ) {

        const file =
          req.files.image;

        const uploaded =
          await cloudinary.uploader.upload(
            file.tempFilePath,
            {
              folder:
                "girls/main",
            }
          );

        imageUrl =
          convertCloudinaryUrl(
            uploaded.secure_url
          );
      }

      /* =========================================
         MULTIPLE IMAGES
      ========================================= */

      if (
        req.files &&
        req.files.images
      ) {

        const files =
          Array.isArray(
            req.files.images
          )
            ? req.files.images
            : [req.files.images];

        const uploadedImages =
          await Promise.all(

            files.map(
              (file) =>
                cloudinary.uploader.upload(
                  file.tempFilePath,
                  {
                    folder:
                      "girls/gallery",
                  }
                )
            )
          );

        images =
          uploadedImages.map(
            (img) =>
              convertCloudinaryUrl(
                img.secure_url
              )
          );
      }

      /* =========================================
         DESCRIPTION
      ========================================= */

      const description =
        await processEditorImages(
          req.body
            .description
        );

      /* =========================================
         CREATE GIRL
      ========================================= */

      const girl =
        await Girl.create({

          name:
            req.body.name,

          age:
            req.body.age,

          heading:
            req.body.heading,

          city:
            parseCity(
              req.body.city
            ),

          subCity:
            req.body.subCity ||
            null,

          permalink:
            req.body.permalink ||
            req.body.name,

          description,

          imageUrl,

          images,

          imageAlt:
            req.body.imageAlt,

          /* SEO */

          seoTitle:
            req.body
              .seoTitle,

          seoDescription:
            req.body
              .seoDescription,

          seoKeywords:
            req.body
              .seoKeywords
              ?.split(",") ||
            [],

          /* OG SEO */

          ogTitle:
            req.body
              .ogTitle,

          ogDescription:
            req.body
              .ogDescription,

          twitterTitle:
            req.body
              .twitterTitle,

          twitterDescription:
            req.body
              .twitterDescription,

          facebookTitle:
            req.body
              .facebookTitle,

          facebookDescription:
            req.body
              .facebookDescription,

          /* PHONE */

          phoneNumber:
            formatNumber(
              req.body
                .phoneNumber
            ),

          whatsappNumber:
            req.body
              .whatsappNumber
              ? formatNumber(
                  req.body
                    .whatsappNumber
                )
              : undefined,

          showOnHomepage:
            req.body
              .showOnHomepage ===
            "true",
        });

      res.status(201).json({
        success: true,
        message:
          "Girl created successfully",
        data: girl,
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        success: false,
        message:
          err.message,
      });
    }
  };

/* =========================================
   UPDATE GIRL
========================================= */

export const updateGirl =
  async (req, res) => {

    try {

      const existing =
        await Girl.findById(
          req.params.id
        );

      if (!existing) {

        return res.status(
          404
        ).json({
          success: false,
          message:
            "Girl not found",
        });
      }

      let imageUrl =
        existing.imageUrl;

      let images =
        existing.images ||
        [];

      /* =========================================
         SINGLE IMAGE
      ========================================= */

      if (
        req.files &&
        req.files.image
      ) {

        const file =
          req.files.image;

        const uploaded =
          await cloudinary.uploader.upload(
            file.tempFilePath,
            {
              folder:
                "girls/main",
            }
          );

        imageUrl =
          convertCloudinaryUrl(
            uploaded.secure_url
          );
      }

      /* =========================================
         MULTIPLE IMAGES
      ========================================= */

      if (
        req.files &&
        req.files.images
      ) {

        const files =
          Array.isArray(
            req.files.images
          )
            ? req.files.images
            : [req.files.images];

        const uploadedImages =
          await Promise.all(

            files.map(
              (file) =>
                cloudinary.uploader.upload(
                  file.tempFilePath,
                  {
                    folder:
                      "girls/gallery",
                  }
                )
            )
          );

        images =
          uploadedImages.map(
            (img) =>
              convertCloudinaryUrl(
                img.secure_url
              )
          );
      }

      /* =========================================
         DESCRIPTION
      ========================================= */

      const description =
        req.body
          .description
          ? await processEditorImages(
              req.body
                .description
            )
          : existing.description;

      /* =========================================
         UPDATE DATA
      ========================================= */

      const updateData = {

        name:
          req.body.name,

        age:
          req.body.age,

        heading:
          req.body.heading,

        city:
          parseCity(
            req.body.city
          ),

        subCity:
          req.body.subCity &&
          req.body.subCity !==
            "" &&
          req.body.subCity !==
            "null"
            ? req.body.subCity
            : null,

        permalink:
          req.body
            .permalink,

        description,

        imageUrl,

        images,

        imageAlt:
          req.body.imageAlt,

        seoTitle:
          req.body
            .seoTitle,

        seoDescription:
          req.body
            .seoDescription,

        seoKeywords:
          req.body
            .seoKeywords
            ?.split(",") ||
          [],

        ogTitle:
          req.body.ogTitle,

        ogDescription:
          req.body
            .ogDescription,

        twitterTitle:
          req.body
            .twitterTitle,

        twitterDescription:
          req.body
            .twitterDescription,

        facebookTitle:
          req.body
            .facebookTitle,

        facebookDescription:
          req.body
            .facebookDescription,

        phoneNumber:
          formatNumber(
            req.body
              .phoneNumber
          ),

        whatsappNumber:
          req.body
            .whatsappNumber
            ? formatNumber(
                req.body
                  .whatsappNumber
              )
            : undefined,

        showOnHomepage:
          req.body
            .showOnHomepage ===
          "true",
      };

      const updated =
        await Girl.findByIdAndUpdate(
          req.params.id,
          updateData,
          {
            new: true,
            runValidators:
              true,
          }
        )

          .populate("city")

          .populate(
            "subCity"
          );

      res.json({
        success: true,
        message:
          "Girl updated successfully",
        data: updated,
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        success: false,
        message:
          err.message,
      });
    }
  };

/* =============================
   GET ALL GIRLS
============================= */

export const getAllGirls =
  async (req, res) => {

    try {

      const girls =
        await Girl.find()

          .populate({
            path: "city",
          })

          .sort({
            createdAt: -1,
          });

      res.json({
        data: girls,
      });

    } catch (error) {

      res.status(500).json({
        message:
          error.message,
      });
    }
  };

/* =============================
   GET BY ID
============================= */

export const getGirlById =
  async (req, res) => {

    try {

      const girl =
        await Girl.findById(
          req.params.id
        )

          .populate("city")

          .populate(
            "subCity"
          );

      if (!girl) {

        return res.status(
          404
        ).json({
          message:
            "Not found",
        });
      }

      res.json(girl);

    } catch (err) {

      res.status(500).json({
        message:
          err.message,
      });
    }
  };

/* =============================
   GET BY CITY
============================= */

export const getGirlsByCity =
  async (req, res) => {

    try {

      const girls =
        await Girl.find({
          city:
            req.params.cityId,
          status: "Active",
        })

          .populate("city")

          .populate(
            "subCity"
          );

      res.json(girls);

    } catch (err) {

      res.status(500).json({
        message:
          err.message,
      });
    }
  };

/* =============================
   GET BY SUBCITY
============================= */

export const getGirlsBySubCity =
  async (req, res) => {

    try {

      const girls =
        await Girl.find({
          subCity:
            req.params
              .subCityId,
          status: "Active",
        })

          .populate("city")

          .populate(
            "subCity"
          );

      res.json(girls);

    } catch (err) {

      res.status(500).json({
        message:
          err.message,
      });
    }
  };

/* =============================
   DELETE
============================= */

export const deleteGirl =
  async (req, res) => {

    try {

      await Girl.findByIdAndDelete(
        req.params.id
      );

      res.json({
        success: true,
        message:
          "Deleted",
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

/* =============================
   STATUS
============================= */

export const toggleGirlStatus =
  async (req, res) => {

    try {

      const girl =
        await Girl.findById(
          req.params.id
        );

      if (!girl) {

        return res.status(
          404
        ).json({
          success: false,
          message:
            "Girl not found",
        });
      }

      girl.status =
        girl.status ===
        "Active"
          ? "Inactive"
          : "Active";

      await girl.save();

      res.json(girl);

    } catch (error) {

      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

/* =============================
   GET GIRL BY PERMALINK
============================= */

export const getGirlByPermalink =
  async (req, res) => {

    try {

      const {
        permalink,
      } = req.params;

      const girl =
        await Girl.findOne({
          permalink,
          status: "Active",
        })

          .populate("city")

          .populate(
            "subCity"
          );

      if (!girl) {

        return res.status(
          404
        ).json({
          success: false,
          message:
            "Girl not found",
        });
      }

      res.json(girl);

    } catch (error) {

      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

/* =============================
   GET GIRL BY SLUG
============================= */

export const getGirlBySlug =
  async (req, res) => {

    try {

      const {
        seoSlug,
      } = req.params;

      const girl =
        await Girl.findOne({
          permalink:
            seoSlug,
        })

          .populate("city")

          .populate(
            "subCity"
          );

      if (!girl) {

        return res.status(
          404
        ).json({
          success: false,
          message:
            "Girl not found",
        });
      }

      res.json(girl);

    } catch (error) {

      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };