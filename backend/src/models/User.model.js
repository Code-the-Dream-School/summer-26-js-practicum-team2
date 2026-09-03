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
    is_disabled: {
      type: Boolean,
      default: false,
    },
    disabled_at: {
      type: Date,
      default: null,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
    deletion_scheduled_at: {
      type: Date,
      default: null,
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
    //profile//
    avatar_url: {
      type: String,
      default: null,
    },
    goals: {
      type: String,
      default: "",
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
    //archival status
    is_archived: { type: Boolean, default: false },
    archived_at: { type: Date, default: null },

    //admin verification for deletion
    deletion_status: {
      type: String,
      enum: ["none", "pending", "approved", "denied"],
      default: "none",
    },
    deletion_requested_at: {
      type: Date,
      default: null,
    },
    deletion_approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reactivation_token: { type: String, select: false },
    reactivation_expires_at: { type: Date },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);
//auto middleware: excludes archived/deleted users from normal search queries. hides the users marked is_archived. $ne: true in MongoDB means not equal to : true
userSchema.pre(/^find/, function () {
  const queryFilter = this.getFilter();
  const multipleExclusionConditions = {};

  if (queryFilter.is_archived === undefined) {
    multipleExclusionConditions.is_archived = { $ne: true };
  }
  if (queryFilter.is_deleted === undefined) {
    multipleExclusionConditions.is_deleted = { $ne: true };
  }
  if (Object.keys(multipleExclusionConditions).length > 0) {
    this.find(multipleExclusionConditions);
  }
});
/* ====== Removed archivedUserSchema because we created a flag directly in the user Schema
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
);*/
userSchema.index({ deletion_status: 1 });
userSchema.index({ reactivation_token: 1 });

const User = mongoose.model("User", userSchema);
//const ArchivedUser = mongoose.model("ArchivedUser", archivedUserSchema);

//module.exports = { User, ArchivedUser };
module.exports = User;
