//need to import mongoose
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please fill in your name."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password_hash: {
      type: String,
      required: [true, "Password is required"],
    },
    email_verified_at: {
      type: Date,
      default: null,
    },
    verification_token: {
      type: String,
      default: null,
      select: false,
    },
    verification_token_expires_at: {
      type: Date,
      default: null,
    },
    password_reset_token: {
      type: String,
      default: null,
      select: false,
    },
    password_reset_expires_at: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ["learner", "admin"],
      default: "learner",
    },
    tos_agreement: {
      type: Boolean,
      required: true,
    },
    tos_agreement_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

const archivedUserSchema = new mongoose.Schema(
  {
    original_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    name: { type: String },
    email: { type: String },
    role: { type: String },
    deleted_at: {
      type: Date,
      default: Date.now,
      expires: 2592000, //MongoDB automatically deletes this document 30Days after deleted_at
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

const User = mongoose.model("User", userSchema);
const ArchivedUser = mongoose.model("ArchivedUser", archivedUserSchema);

module.exports = { User, ArchivedUser };
