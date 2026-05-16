import Contact from "../models/Contact.js";

// ===============================
// CREATE CONTACT ENTRY
// ===============================
export const createContact = async (req, res) => {
  try {
    const { name, mobile, email, subject, message, captcha } = req.body;

    const entry = await Contact.create({
      name,
      mobile,
      email,
      subject,
      message,
      captcha,
    });

    return res.status(201).json({
      message: "Contact enquiry submitted!",
      data: entry,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// GET ALL CONTACT ENTRIES
// ===============================
export const getAllContacts = async (req, res) => {
  try {
    const list = await Contact.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// GET SINGLE CONTACT BY ID
// ===============================
export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact)
      return res.status(404).json({ message: "Record not found" });

    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// DELETE CONTACT ENTRY
// ===============================
export const deleteContact = async (req, res) => {
  try {
    const deleted = await Contact.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res.status(404).json({ message: "Record not found" });

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===============================
// TOGGLE STATUS (New → Seen → Resolved)
// ===============================
export const toggleContactStatus = async (req, res) => {
  try {
    const entry = await Contact.findById(req.params.id);

    if (!entry)
      return res.status(404).json({ message: "Record not found" });

    if (entry.status === "New") entry.status = "Seen";
    else if (entry.status === "Seen") entry.status = "Resolved";
    else entry.status = "New";

    await entry.save();

    res.json({
      message: "Status updated",
      status: entry.status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
