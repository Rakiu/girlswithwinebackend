import mongoose from "mongoose";

const FaqSchema = new mongoose.Schema({
  // Yeh array field hona zaroori hai
  faqs: [
    {
      question: { type: String, required: true },
      answer: { type: String, required: true },
    }
  ],
  type: { type: String, enum: ["homepage", "city", "subcity", "girl"], required: true },
  city: { type: mongoose.Schema.Types.ObjectId, ref: "City" },
  subCity: { type: mongoose.Schema.Types.ObjectId, ref: "SubCity" },
  girl: { type: mongoose.Schema.Types.ObjectId, ref: "Girl" },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
}, { timestamps: true });

export default mongoose.models.Faq || mongoose.model("Faq", FaqSchema);