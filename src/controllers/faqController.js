import Faq from "../models/Faq.js";

/* =========================================================
   CREATE FAQ
========================================================= */

export const addFaq = async (req, res) => {
  try {

    const data = req.body;

    // BULK CREATE
    if (Array.isArray(data)) {

      const faqs = await Faq.insertMany(data);

      return res.status(201).json({
        success: true,
        message: "FAQs created successfully",
        faqs,
      });
    }

    // SINGLE CREATE
    const faq = await Faq.create(data);

    return res.status(201).json({
      success: true,
      message: "FAQ created successfully",
      faq,
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* =========================================================
   GET ALL FAQ
========================================================= */

export const getFaqs = async (req, res) => {
  try {

    const faqs = await Faq.find()

      .populate("city", "mainCity")

      .populate("subCity", "name")

      .populate("girl", "name")

      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      faqs,
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* =========================================================
   HOMEPAGE FAQ
========================================================= */

export const getHomepageFaqs = async (req, res) => {
  try {

    const faqGroup = await Faq.findOne({
      type: "homepage",
      status: "Active",
    });

    if (!faqGroup) {

      return res.status(200).json({
        success: true,
        faqs: [],
      });
    }

    // ONLY HOMEPAGE FAQ
    const visibleFaqs = faqGroup.faqs.filter(
      (f) => f.showOn?.homepage === true
    );

    return res.status(200).json({
      success: true,
      faqs: visibleFaqs,
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* =========================================================
   CITY FAQ
========================================================= */

export const getFaqsByCity = async (req, res) => {
  try {

    const { cityId } = req.params;

    const faqGroup = await Faq.findOne({
      city: cityId,
      status: "Active",
    });

    if (!faqGroup) {

      return res.status(200).json({
        success: true,
        faqs: [],
      });
    }

    const visibleFaqs = faqGroup.faqs.filter(
      (f) => f.showOn?.city === true
    );

    return res.status(200).json({
      success: true,
      faqs: visibleFaqs,
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* =========================================================
   SUBCITY FAQ
========================================================= */

export const getFaqsBySubCity = async (req, res) => {
  try {

    const { subCityId } = req.params;

    const faqGroup = await Faq.findOne({
      subCity: subCityId,
      status: "Active",
    });

    if (!faqGroup) {

      return res.status(200).json({
        success: true,
        faqs: [],
      });
    }

    const visibleFaqs = faqGroup.faqs.filter(
      (f) => f.showOn?.subcity === true
    );

    return res.status(200).json({
      success: true,
      faqs: visibleFaqs,
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* =========================================================
   GIRL PROFILE FAQ
========================================================= */

export const getFaqsByGirl = async (req, res) => {
  try {

    const { girlId } = req.params;

    const faqGroup = await Faq.findOne({
      girl: girlId,
      status: "Active",
    });

    if (!faqGroup) {

      return res.status(200).json({
        success: true,
        faqs: [],
      });
    }

    const visibleFaqs = faqGroup.faqs.filter(
      (f) => f.showOn?.girl === true
    );

    return res.status(200).json({
      success: true,
      faqs: visibleFaqs,
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* =========================================================
   UPDATE FAQ
========================================================= */

export const updateFaq = async (req, res) => {
  try {

    const faq = await Faq.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!faq) {

      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "FAQ updated successfully",
      faq,
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* =========================================================
   DELETE FAQ
========================================================= */

export const deleteFaq = async (req, res) => {
  try {

    const faq = await Faq.findByIdAndDelete(
      req.params.id
    );

    if (!faq) {

      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "FAQ deleted successfully",
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* =========================================================
   TOGGLE STATUS
========================================================= */

export const toggleFaqStatus = async (req, res) => {
  try {

    const faq = await Faq.findById(
      req.params.id
    );

    if (!faq) {

      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    faq.status =
      faq.status === "Active"
        ? "Inactive"
        : "Active";

    await faq.save();

    return res.status(200).json({
      success: true,
      message: "FAQ status updated",
      faq,
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* =========================================================
   GET FAQ BY TYPE
========================================================= */

export const getFaqsByType = async (req, res) => {
  try {

    const { type } = req.params;

    const faqGroups = await Faq.find({
      type,
      status: "Active",
    })

      .populate("city", "mainCity")

      .populate("subCity", "name")

      .populate("girl", "name")

      .sort({ createdAt: -1 });

    const updatedFaqs = faqGroups.map(
      (group) => {

        let filteredFaqs = [];

        // HOMEPAGE
        if (type === "homepage") {

          filteredFaqs = group.faqs.filter(
            (f) =>
              f.showOn?.homepage === true
          );
        }

        // CITY
        else if (type === "city") {

          filteredFaqs = group.faqs.filter(
            (f) =>
              f.showOn?.city === true
          );
        }

        // SUBCITY
        else if (type === "subcity") {

          filteredFaqs = group.faqs.filter(
            (f) =>
              f.showOn?.subcity === true
          );
        }

        // GIRL
        else if (type === "girl") {

          filteredFaqs = group.faqs.filter(
            (f) =>
              f.showOn?.girl === true
          );
        }

        return {
          ...group.toObject(),
          faqs: filteredFaqs,
        };
      }
    );

    return res.status(200).json({
      success: true,
      faqs: updatedFaqs,
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* =========================================================
   GET FAQS BY VISIBILITY
========================================================= */

export const getFaqsByVisibility = async (req, res) => {
  try {

    const {
      type,
      visible,
      cityId,
      subCityId,
      girlId,
    } = req.query;

    /* =========================================
       BASE QUERY
    ========================================= */

    const query = {
      status: "Active",
    };

    // TYPE
    if (type) {
      query.type = type;
    }

    // CITY
    if (cityId) {
      query.city = cityId;
    }

    // SUBCITY
    if (subCityId) {
      query.subCity = subCityId;
    }

    // GIRL
    if (girlId) {
      query.girl = girlId;
    }

    /* =========================================
       FIND FAQS
    ========================================= */

    const faqGroups = await Faq.find(query)

      .populate("city", "mainCity")

      .populate("subCity", "name")

      .populate("girl", "name")

      .sort({ createdAt: -1 });

    /* =========================================
       FILTER FAQS
    ========================================= */

    const updatedFaqs = faqGroups.map((group) => {

      let filteredFaqs = group.faqs;

      // BOOLEAN CONVERT
      const isVisible =
        visible === "true";

      // HOMEPAGE
      if (type === "homepage") {

        filteredFaqs = group.faqs.filter(
          (f) =>
            f.showOn?.homepage === isVisible
        );

      }

      // CITY
      else if (type === "city") {

        filteredFaqs = group.faqs.filter(
          (f) =>
            f.showOn?.city === isVisible
        );

      }

      // SUBCITY
      else if (type === "subcity") {

        filteredFaqs = group.faqs.filter(
          (f) =>
            f.showOn?.subcity === isVisible
        );

      }

      // GIRL
      else if (type === "girl") {

        filteredFaqs = group.faqs.filter(
          (f) =>
            f.showOn?.girl === isVisible
        );

      }

      return {
        ...group.toObject(),
        faqs: filteredFaqs,
      };
    });

    return res.status(200).json({
      success: true,
      count: updatedFaqs.length,
      faqs: updatedFaqs,
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}; 
