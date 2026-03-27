import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    girl: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Girl",
      required: true
    },

    userName: {
      type: String,
      required: true
    },

    comment: {
      type: String,
      default: ""
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },

    userImage: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);