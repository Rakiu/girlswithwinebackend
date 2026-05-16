import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    mobile: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
    },
    captcha: {
      type: String,
    },
    status: {
      type: String,
      enum: ["New", "Seen", "Resolved"],
      default: "New",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Contact", ContactSchema);
