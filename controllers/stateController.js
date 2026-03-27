import State from "../models/state.js";

// ------------------------ CREATE ------------------------
export const createState = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) return res.status(400).json({ message: "State name is required" });

    const normalized = name.trim().toLowerCase();

    const exists = await State.findOne({ name: normalized });
    if (exists) {
      return res.status(200).json({ message: "State already exists", data: exists });
    }

    const state = await State.create({ name: normalized });

    res.status(201).json({ message: "State created", data: state });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------------ GET ALL ------------------------
export const getStates = async (req, res) => {
  try {
    const list = await State.find().sort({ name: 1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------------ GET BY ID ------------------------
export const getStateById = async (req, res) => {
  try {
    const state = await State.findById(req.params.id);
    if (!state) return res.status(404).json({ message: "State not found" });

    res.json(state);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------------ UPDATE ------------------------
export const updateState = async (req, res) => {
  try {
    const { name } = req.body;

    const updates = {};
    if (name) updates.name = String(name).trim().toLowerCase();

    const updated = await State.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: "State not found" });

    res.json({ message: "State updated", data: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------------ DELETE ------------------------
export const deleteState = async (req, res) => {
  try {
    const deleted = await State.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "State not found" });

    res.json({ message: "State deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------------ TOGGLE STATUS ------------------------
export const toggleStateStatus = async (req, res) => {
  try {
    const state = await State.findById(req.params.id);

    if (!state) return res.status(404).json({ message: "State not found" });

    state.status = state.status === "Active" ? "Inactive" : "Active";
    await state.save();

    res.json({ message: "State status changed", status: state.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
