const mongoose = require("mongoose");
const XpEvent = require("../models/XpEvent.model");
const { User } = require("../models/User.model");

const getUserXpTotal = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return 0;
  }

  const result = await XpEvent.aggregate([
    {
      $match: {
        user_id: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: null,
        totalXp: {
          $sum: "$amount",
        },
      },
    },
  ]);

  return result[0]?.totalXp || 0;
};

async function getXpEarnedToday(userId) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return 0;
  }
  const user = await User.findById(userId).select("timezone");

  const timezone = user?.timezone || "UTC";

  //Current date in the user's timezone
  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const dateString = formatter.format(now);

  const startOfDay = new Date(`${dateString}T00:00:00`);
  const endOfDay = new Date(`${dateString}T23:59:59.999`);

  const xpEvents = await XpEvent.find({
    user_id: userId,
    createdAt: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  }).select("amount");

  const totalXpToday = xpEvents.reduce((total, event) => total + event.amount, 0);

  console.log("XpEarnedToday", totalXpToday);

  return totalXpToday;
}

module.exports = { getUserXpTotal, getXpEarnedToday };
