//need to import mongoose
const mongoose = require("mongoose");

//present pageTourSchema for onboarding so userSchema can use it

const pageTourSchema = new mongoose.Schema(
  {
    step: { type: Number, default: 0 },
    dismissed: { type: Boolean, default: false },
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
      xp_awarded: { type: Boolean, default: false },
      started_at: {
        type: Date,
        default: null,
      },
      completed_at: { type: Date, default: null },
      tours: {
        dashboardPage: {
          type: pageTourSchema,
          default: () => ({ step: 0, dismissed: false }),
        },
        learningPath: {
          type: pageTourSchema,
          default: () => ({ step: 0, dismissed: false }),
        },
        lessonPage: {
          type: pageTourSchema,
          default: () => ({ step: 0, dismissed: false }),
        },
        profilePage: {
          type: pageTourSchema,
          default: () => ({ step: 0, dismissed: false }),
        },
      },
    },
    streak: {
      current: {
        type: Number,
        default: 0,
      },
      longest: {
        type: Number,
        default: 0,
      },
      active_learning_days: {
        type: Number,
        default: 0,
      },
      last_active_date: {
        type: Date,
        default: null,
      },
    },
    timezone: {
      type: String,
      default: "UTC",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  },
);

const User = mongoose.model("User", userSchema);
// const ArchivedUser = mongoose.model("ArchivedUser", archivedUserSchema);

module.exports = { User };
