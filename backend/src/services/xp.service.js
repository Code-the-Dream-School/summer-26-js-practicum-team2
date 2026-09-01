const mongoose = require("mongoose");
const XpEvent = require("../models/XpEvent.model");

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

module.exports = { getUserXpTotal };
