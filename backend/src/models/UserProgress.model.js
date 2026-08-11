//need to import mongoose
const mongoose = require("mongoose");
const userProgressSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    module_id: {
      type: String,
      required: true,
      default: "cashFlow",
    },
    course_module_id: {
      type: String,
      required: true,
      default: "module-1",
    },
    course_lesson_id: {
      type: String,
      required: true,
      default: "1.1",
    },
    current_micro_lesson_id: {
      type: String,
      required: true,
      default: "1.1.1",
    },
    completed_lessons: [
      {
        type: String,
      },
    ],
    completed_micro_lessons: [
      {
        type: String,
      },
    ],
    is_module_completed: {
      type: Boolean,
      default: false,
    },
    earned_badges: [
      {
        badge_name: String,
        awarded_at: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: { createdAt: false, updatedAt: "updated_at" },
  },
);
//one progress document per user per module
userProgressSchema.index({ user_id: 1, module_id: 1 }, { unique: true });
userProgressSchema.index({ user_id: 1, updated_at: -1 });
module.exports = mongoose.model("UserProgress", userProgressSchema);
