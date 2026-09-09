//need to import mongoose
const mongoose = require("mongoose");
const answerSchema = new mongoose.Schema(
  {
    question_id: {
      type: String,
      required: true,
    },
    selected_choice_ids: [
      {
        type: String,
        required: true,
      },
    ],
    is_correct: {
      type: Boolean,
      required: true,
    },
  },
  { _id: false },
);
const quizAttemptSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    module_id: {
      type: String,
      required: true,
      index: true,
    },
    lesson_id: {
      type: String,
      required: true,
      index: true,
    },
    micro_lesson_id: {
      type: String,
      required: true,
      index: true,
    },
    attempt_number: {
      type: Number,
      required: true,
      default: 1,
    },
    started_at: {
      type: Date,
      default: Date.now,
      required: true,
    },
    submitted_at: {
      type: Date,
      default: null,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    passed: {
      type: Boolean,
      default: false,
    },
    pass_threshold: {
      type: Number,
      default: 70,
    },
    answers: [answerSchema],
  },
  {
    timestamps: true,
  },
);

// look up user's attempt history on a specific micro lesson and check for unsubmitted active attempts

quizAttemptSchema.index({ user_id: 1, micro_lesson_id: 1, attempt_number: -1 });
quizAttemptSchema.index({ user_id: 1, micro_lesson_id: 1, submitted_at: 1 });

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);
