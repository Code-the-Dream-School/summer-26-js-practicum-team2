//need to import mongoose
const mongoose = require("mongoose");

//present pageTourSchema for onboarding so userSchema can use it

const pageTourSchema = new mongoose.Schema(
  {
    step: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "completed", "skipped"],
      default: "pending",
    },
    dismissed: { type: Boolean, default: false },
    completed_at: { type: Date, default: null },
  },
  { _id: false },
);

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
    onboarding: {
      is_completed: { type: Boolean, default: false },
      current_step: { type: Number, default: 0 }, //track step  to resume based on index
      started_at: {
        type: Date,
        default: null,
      },
      completed_at: { type: Date, default: null },
      tours: {
        dashboardPage: {
          type: pageTourSchema,
          default: () => ({ step: 0, status: "pending", dismissed: false }),
        },
        profilePage: {
          type: pageTourSchema,
          default: () => ({ step: 1, status: "pending", dismissed: false }),
        },
        lessonPage: {
          type: pageTourSchema,
          default: () => ({ step: 2, status: "pending", dismissed: false }),
        },
        learningPath: {
          type: pageTourSchema,
          default: () => ({ step: 3, status: "pending", dismissed: false }),
        },
      },
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

const User = mongoose.model("User", userSchema);

module.exports = User;
