import Faq from "../models/Faq.js";

/* ================= CREATE (BULK SUPPORT) ================= */
export const addFaq = async (req, res) => {
  try {
    // Agar frontend se array aa raha hai toh insertMany use hoga
    // Agar single object hai toh create use hoga
    const data = req.body;
    
    if (Array.isArray(data)) {
      const faqs = await Faq.insertMany(data);
      return res.status(201).json(faqs);
    } else {
      const faq = await Faq.create(data);
      return res.status(201).json(faq);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET ALL ================= */
export const getFaqs = async (req, res) => {
  try {
    // Admin panel ke liye saare FAQs (Active + Inactive) dikhana behtar hai
    const faqs = await Faq.find()
      .populate("city", "mainCity")
      .populate("subCity", "name")
      .populate("girl", "name")
      .sort({ createdAt: -1 }); // Latest first

    res.json(faqs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= BY TYPE ================= */
export const getFaqsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const faqs = await Faq.find({ type, status: "Active" });
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= CITY ================= */
export const getFaqsByCity = async (req, res) => {
  try {
    const { cityId } = req.params;
    const faqs = await Faq.find({ city: cityId, status: "Active" });
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= SUBCITY ================= */
export const getFaqsBySubCity = async (req, res) => {
  try {
    const { subCityId } = req.params;
    const faqs = await Faq.find({ subCity: subCityId, status: "Active" });
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= GIRL ================= */
export const getFaqsByGirl = async (req, res) => {
  try {
    const { girlId } = req.params;
    const faqs = await Faq.find({ girl: girlId, status: "Active" });
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE ================= */
export const updateFaq = async (req, res) => {
  try {
    const faq = await Faq.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!faq) return res.status(404).json({ message: "FAQ not found" });
    res.json(faq);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= DELETE ================= */
export const deleteFaq = async (req, res) => {
  try {
    const faq = await Faq.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ message: "FAQ not found" });
    res.json({ message: "FAQ deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= TOGGLE STATUS ================= */
export const toggleFaqStatus = async (req, res) => {
  try {
    const faq = await Faq.findById(req.params.id);
    if (!faq) return res.status(404).json({ message: "FAQ not found" });

    faq.status = faq.status === "Active" ? "Inactive" : "Active";
    await faq.save();

    res.json(faq);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};