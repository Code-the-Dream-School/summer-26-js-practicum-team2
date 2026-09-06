const mongoose = require("mongoose");
const UserProgress = require("../src/models/UserProgress.model");
const { getUserXpTotal } = require("../src/services/xp.service");

jest.mock("../src/models/UserProgress.model");

describe("getUserXpTotal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sums XP from every UserProgress record for a user", async () => {
    const userId = new mongoose.Types.ObjectId();
    UserProgress.aggregate.mockResolvedValue([{ totalXp: 75 }]);

    await expect(getUserXpTotal(userId)).resolves.toBe(75);
    expect(UserProgress.aggregate).toHaveBeenCalledWith([
      {
        $match: {
          user_id: userId,
        },
      },
      {
        $group: {
          _id: null,
          totalXp: { $sum: "$xp" },
        },
      },
    ]);
  });

  it("returns zero without querying for an invalid user ID", async () => {
    await expect(getUserXpTotal("invalid-id")).resolves.toBe(0);
    expect(UserProgress.aggregate).not.toHaveBeenCalled();
  });
});
