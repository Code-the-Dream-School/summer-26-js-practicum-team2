const { StatusCodes } = require("http-status-codes");
const { updateOnboardingProgressSchema } = require("../validation/userValidation.js");
const { User } = require("../models/User.model.js");
const UserProgress = require("../models/UserProgress.model.js");
const { calculateXpDelta } = require("../utils/coreRules.js");
const XpEvent = require("../models/XpEvent.model.js");
//const { STATES } = require("mongoose");

const TOUR_KEYS = ["dashboardPage", "learningPath", "lessonPage", "profilePage"];
//POST /api/v1/onboarding/toggle

const toggleOnboardingWorkflow = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { enabled } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found." });
    }
    if (!user.onboarding) {
      user.onboarding = {};
    }
    //Re-enable onboarding: reset global status and indiv tours
    if (enabled) {
      user.onboarding = {
        is_completed: false,
        started_at: new Date(),
        completed_at: null,
        tours: {
          dashboardPage: { step: 0, dismissed: false },
          learningPath: { step: 0, dismissed: false },
          lessonPage: { step: 0, dismissed: false },
          profilePage: { step: 0, dismissed: false },
        },
      };
    } else {
      //disable onboarding: mark completed and dismiss all tours
      user.onboarding.is_completed = true;
      user.onboarding.completed_at = new Date();

      if (!user.onboarding.tours) {
        user.onboarding.tours = {};
      }
      TOUR_KEYS.forEach((key) => {
        user.onboarding.tours[key] = {
          step: user.onboarding.tours[key]?.step || 0,
          dismissed: true,
        };
      });
    }
    //update mongo database object fields have changed
    user.markModified("onboarding");
    await user.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: `Onboarding workflow ${enabled ? "enabled" : "disabled"} successfully.`,
      onboarding: user.onboarding,
    });
  } catch (error) {
    return next(error);
  }
};
//GET /api/v1/onboarding
const getOnboardingState = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("onboarding");
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found." });
    }
    return res.status(StatusCodes.OK).json({
      success: true,
      onboarding: user.onboarding,
    });
  } catch (err) {
    return next(err);
  }
};

//PATCH /api/v1/onboarding/step (receives updates from frontend when a user moves to next step or new step or dismisses a tour or completes all tours)

const updateOnboardingProgress = async (req, res, next) => {
  try {
    if (updateOnboardingProgressSchema) {
      const { error, value } = updateOnboardingProgressSchema.validate(req.body, {
        abortEarly: false,
      });
      if (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
      }
      req.body = value;
    }
    const userId = req.user.id;
    const { tourKey, step, dismissed, markAllComplete } = req.body;
    //  try {
    //   const userId = req.user.id;
    //   const { tourKey, step, dismissed, markAllComplete } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "No user found." });
    }
    if (!user.onboarding) {
      user.onboarding = {
        is_completed: false,
        xp_awarded: false,
        tours: {},
      };
    }
    if (!user.onboarding.started_at) {
      user.onboarding.started_at = new Date();
    }

    let xpAwarded = 0;

    //Specific tour updates
    if (tourKey) {
      // const validTourKeys = ["dashboardPage", "learningPath", "lessonPage", "profilePage"];
      if (!TOUR_KEYS.includes(tourKey)) {
        //if (!validTourKeys.includes(tourKey)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: `No tourkey found. Need to include one of ${TOUR_KEYS.join(",")}`,
        });
      }
      if (!user.onboarding.tours) {
        user.onboarding.tours = {};
      }

      const currentTour = user.onboarding.tours[tourKey] || {
        step: 0,
        dismissed: false,
      };

      if (typeof step === "number") {
        currentTour.step = step;
      }
      if (typeof dismissed === "boolean") {
        currentTour.dismissed = dismissed;
      }
      user.onboarding.tours[tourKey] = currentTour;
    }

    //check if all single page tours are dismissed
    const tours = user.onboarding.tours || {};
    const allDismissed =
      // tours.dashboardPage.dismissed &&
      // tours.learningPath.dismissed &&
      // tours.lessonPage.dismissed &&
      // tours.profilePage.dismissed;
      TOUR_KEYS.every((key) => tours[key]?.dismissed === true);
    //update all completed

    //Award xp for completing all of onboarding
    if ((markAllComplete || allDismissed) && !user.onboarding.is_completed) {
      user.onboarding.is_completed = true;
      user.onboarding.completed_at = new Date();

      // ****************** TODO: Replace with XP earned today once XP event tracking exists ***************

      //Change to grab user's xp for today
      // const progress = await UserProgress.findOne({
      //   user_id: userId,
      // });

      const currentTotal = 0;

      //Award xp for first time onboarding completion
      const xpResult = calculateXpDelta({
        eventType: "onboarding_complete",
        isFirstTime: !user.onboarding.xp_awarded,
        currentTotal,
      });

      xpAwarded = xpResult.amount;

      if (xpAwarded > 0) {
        user.onboarding.xp_awarded = true;
      }
    }
    user.markModified("onboarding");
    await user.save();

    if (xpAwarded > 0) {
      await UserProgress.findOneAndUpdate(
        { user_id: userId },
        {
          $inc: { xp: xpAwarded },
        },
        { upsert: true, returnDocument: "after" },
      );

      await XpEvent.create({
        user_id: userId,
        event_type: "onboarding_complete",
        amount: xpAwarded,
        reference_id: "onboarding",
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message:
        xpAwarded > 0
          ? `You completed the tour. You earned ${xpAwarded} XP.`
          : "Onboarding progress updated with success.",
      xpAwarded,
      onboarding: user.onboarding,
    });
  } catch (err) {
    return next(err);
  }
};

//POST /api/v1/onboarding/reset
//reset onboarding document to initial state

const resetOnboardingProgress = async (req, res, next) => {
  try {
    //get user id from jwt
    const userId = req.user.id;
    //get user id from mongoDb
    const user = await User.findById(userId);
    //edge case if no user
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found." });
    }
    //reset onboarding subdocument
    user.onboarding = {
      is_completed: false,
      started_at: null,
      completed_at: null,
      tours: {
        dashboardPage: { step: 0, dismissed: false },
        learningPath: { step: 0, dismissed: false },
        lessonPage: { step: 0, dismissed: false },
        profilePage: { step: 0, dismissed: false },
      },
    };
    user.markModified("onboarding");
    //save the user infor in the database
    await user.save();
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Onboarding tour was reset successfully.",
      onboarding: user.onboarding,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  toggleOnboardingWorkflow,
  getOnboardingState,
  updateOnboardingProgress,
  resetOnboardingProgress,
};
