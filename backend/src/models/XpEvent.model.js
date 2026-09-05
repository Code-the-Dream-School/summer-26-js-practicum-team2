const mongoose = require("mongoose");

const xpEventSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event_type: {
      type: String,
      required: true,
      enum: ["onboarding_complete", "lesson_complete", "quiz_pass", "quiz_perfect"],
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    reference_id: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

xpEventSchema.index({ user_id: 1 });
xpEventSchema.index({ createdAt: -1 });
module.exports = mongoose.model("XpEvent", xpEventSchema);
