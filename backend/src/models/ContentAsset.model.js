const mongoose = require("mongoose");

const contentAssetSchema = new mongoose.Schema(
  {
    asset_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    mime_type: {
      type: String,
      enum: ["image/png", "image/jpeg", "image/webp"],
      required: true,
    },
    kind: {
      type: String,
      enum: ["avatar"],
      default: "avatar",
      required: true,
    },
    data: {
      type: Buffer,
      required: true,
    },
    uploaded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ContentAsset", contentAssetSchema);
