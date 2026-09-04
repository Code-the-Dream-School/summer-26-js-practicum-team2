const mongoose = require("mongoose");
const { XP_CAP } = require("../utils/coreRules");
const { getLeaderboardWeek } = require("../utils/leaderboardTime");

const XP_EVENT_TYPES = [
  "lesson_complete",
  "quiz_pass",
  "quiz_perfect",
  "review_complete",
  "daily_goal_met",
  "onboarding_complete",
];

const xpEventSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event_type: {
      type: String,
      enum: XP_EVENT_TYPES,
      required: true,
    },
    source_key: {
      type: String,
      trim: true,
      required: true,
    },
    requested_xp: {
      type: Number,
      min: 0,
      required: true,
    },
    awarded_xp: {
      type: Number,
      min: 0,
      max: XP_CAP,
      required: true,
    },
    occurred_at: {
      type: Date,
      default: Date.now,
      required: true,
    },
    day_start: {
      type: Date,
      required: true,
    },
    week_start: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  },
);

xpEventSchema.pre("validate", function () {
  if (!this.occurred_at || Number.isNaN(this.occurred_at.getTime())) return;

  this.day_start = new Date(
    Date.UTC(
      this.occurred_at.getUTCFullYear(),
      this.occurred_at.getUTCMonth(),
      this.occurred_at.getUTCDate(),
    ),
  );
  this.week_start = getLeaderboardWeek(this.occurred_at).weekStart;
});

xpEventSchema.index({ user_id: 1, source_key: 1 }, { unique: true });
xpEventSchema.index({ user_id: 1, day_start: 1 });
xpEventSchema.index({ week_start: 1, user_id: 1 });

const XpEvent = mongoose.model("XpEvent", xpEventSchema);

module.exports = XpEvent;
module.exports.XP_EVENT_TYPES = XP_EVENT_TYPES;
