const mongoose = require("mongoose");
const DailyXpTotal = require("../models/DailyXpTotal.model");
const XpEvent = require("../models/XpEvent.model");
const { XP_EVENT_TYPES } = require("../models/XpEvent.model");
const { XP_CAP } = require("../utils/coreRules");

function getUtcDayStart(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function validateAwardInput({ userId, eventType, sourceKey, requestedXp, occurredAt }) {
  if (!mongoose.isValidObjectId(userId)) throw new TypeError("A valid user ID is required.");
  if (!XP_EVENT_TYPES.includes(eventType))
    throw new TypeError("A supported XP event type is required.");
  if (typeof sourceKey !== "string" || sourceKey.trim() === "") {
    throw new TypeError("A non-empty XP source key is required.");
  }
  if (!Number.isFinite(requestedXp) || requestedXp <= 0) {
    throw new TypeError("Requested XP must be a positive number.");
  }
  if (Number.isNaN(occurredAt.getTime())) throw new TypeError("A valid award date is required.");
}

async function awardXp({ userId, eventType, sourceKey, requestedXp, occurredAt = new Date() }) {
  const awardDate = occurredAt instanceof Date ? new Date(occurredAt) : new Date(occurredAt);
  validateAwardInput({ userId, eventType, sourceKey, requestedXp, occurredAt: awardDate });

  const normalizedSourceKey = sourceKey.trim();
  const normalizedUserId = new mongoose.Types.ObjectId(userId);
  const dayStart = getUtcDayStart(awardDate);
  const session = await mongoose.startSession();
  let result;

  try {
    await session.withTransaction(async () => {
      const existingEvent = await XpEvent.findOne({
        user_id: normalizedUserId,
        source_key: normalizedSourceKey,
      }).session(session);

      if (existingEvent) {
        result = {
          event: existingEvent,
          duplicate: true,
          capped: existingEvent.awarded_xp < existingEvent.requested_xp,
        };
        return;
      }

      const dailyTotal = await DailyXpTotal.findOneAndUpdate(
        { user_id: normalizedUserId, day_start: dayStart },
        [
          {
            $set: {
              user_id: normalizedUserId,
              day_start: dayStart,
              last_awarded_xp: {
                $min: [
                  requestedXp,
                  {
                    $max: [0, { $subtract: [XP_CAP, { $ifNull: ["$xp_total", 0] }] }],
                  },
                ],
              },
              xp_total: {
                $min: [XP_CAP, { $add: [{ $ifNull: ["$xp_total", 0] }, requestedXp] }],
              },
            },
          },
        ],
        {
          upsert: true,
          returnDocument: "after",
          session,
        },
      );
      const awardedXp = dailyTotal.last_awarded_xp;
      const [event] = await XpEvent.create(
        [
          {
            user_id: normalizedUserId,
            event_type: eventType,
            source_key: normalizedSourceKey,
            requested_xp: requestedXp,
            awarded_xp: awardedXp,
            occurred_at: awardDate,
          },
        ],
        { session },
      );

      result = {
        event,
        duplicate: false,
        capped: awardedXp < requestedXp,
        remainingToday: XP_CAP - dailyTotal.xp_total,
      };
    });
  } catch (error) {
    if (error?.code === 11000) {
      const existingEvent = await XpEvent.findOne({
        user_id: normalizedUserId,
        source_key: normalizedSourceKey,
      });
      if (existingEvent) {
        return {
          event: existingEvent,
          duplicate: true,
          capped: existingEvent.awarded_xp < existingEvent.requested_xp,
        };
      }
    }
    throw error;
  } finally {
    await session.endSession();
  }

  return result;
}

module.exports = { awardXp, getUtcDayStart };
