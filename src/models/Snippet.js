import mongoose from "mongoose";

const snippetSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    language: { type: String, required: true, lowercase: true, trim: true },
    code: { type: String, required: true },
    tags: [{ type: String, lowercase: true, trim: true }],
    visibility: {
      type: String,
      enum: ["public", "private", "unlisted"],
      default: "public",
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    forkedFrom: { type: mongoose.Schema.Types.ObjectId, ref: "Snippet", default: null },
    stars: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    currentVersion: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.model("Snippet", snippetSchema);