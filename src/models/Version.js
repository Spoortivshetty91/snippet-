import mongoose from "mongoose";

const versionSchema = new mongoose.Schema(
  {
    snippet: { type: mongoose.Schema.Types.ObjectId, ref: "Snippet", required: true },
    code: { type: String, required: true },
    versionNumber: { type: Number, required: true },
    changeNote: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Version", versionSchema);