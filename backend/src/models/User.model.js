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
    // additional updates for profile and user account features
    // revoke old JWT session and occurs with a change in passwords
    token_version: {
      type: Number,
      default: 0,
    },
    //profile
    avatar_url: {
      type: String,
      default: null,
    },
    goals: {
      type: String,
      default: "",
    },
    theme: {
      type: String,
      enum: ["Light", "Dark"],
      default: "Light",
    },
    notifications: {
      type: Boolean,
      default: true,
    },
    //Achievements
    xp: {
      type: Number,
      default: 0,
    },
    streak: {
      type: Number,
      default: 0,
    },
    // Soft-deleted accounts
    is_deleted: {
      type: Boolean,
      default: false,
    },
    deleted_at: {
      type: Date,
      default: null, // Tracks when deletion occurs
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
