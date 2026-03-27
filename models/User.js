import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  mobile: {
    type: String,
    required: true,
    unique: true
  },

  password: { type: String, required: true },

  country: { type: String, default: "India" },

  gender: {
    type: String,
    enum: ["Male", "Female", "Others"],
    required: true
  },

  coins: { type: Number, default: 0 },
  adsLimit: { type: Number, default: 1 },
  adsPosted: { type: Number, default: 0 },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Password Hashing
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model("User", userSchema);
