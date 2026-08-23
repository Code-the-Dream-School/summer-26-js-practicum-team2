const { StatusCodes } = require("http-status-codes");
const User = require("../models/User.model.js");

/* pseudocode: get the authenticated user's ID attached by JWTMIddleware 
    2. get's the user from the mongoDB filtering only by the onboarding subdocument
    3.handle edge case if user doesn't exist
    return success status with onboarding DataTransfer
    pass errors to error handling skipMiddlewareFunction*/

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

//PATCH /api/v1/onboarding (receives updates from frontend when a user moves to next step or new step or dismisses a tour or completes all tours)
/*1. get user id from req.user via jwt middleware
2. Define the expected fields  from the JSON response body we are interested in which will need to be sent via front end to update any Selection
get the user information from the mongoDB  by finding by the id 
handle edge case if user doesnt' exist
otherwise wait for user to start onboarding and record today's date
validate and update specific page TOO_MANY_REQUESTS
if not valid tourkeys as in pages to ViewTransition, give a code for a bad request and a json message
send information for which step user is in and if user dismissed tour KeyboardEvent
mark total dismissed and  all complete , save the user information for the dataabase
send an okay status update from JSON */

const updateOnboardingProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { tourKey, step, dismissed, markAllComplete } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: " No user found." });
    }
    if (!user.onboarding.started_at) {
      user.onboarding.started_at = new Date();
    }
    if (tourKey) {
      const validTourKeys = ["dashboardPage", "learningPath", "lessonPage", "profilePage"];
      if (!validTourKeys.includes(tourKey)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: `No tourkey found. Need to include one of ${validTourKeys.join(",")}`,
        });
      }
      if (typeof step === "number") {
        user.onboarding.tours[tourKey].step = step;
      }
      if (typeof dismissed === "boolean") {
        user.onboarding.tours[tourKey].dismissed = dismissed;
      }
    }
    //check if all single page tours are dismissed
    const tours = user.onboarding.tours;
    const allDismissed =
      tours.dashboardPage.dismissed &&
      tours.learningPath.dismissed &&
      tours.lessonPage.dismissed &&
      tours.profilePage.dismissed;
    //how many total onboarding completed
    if ((markAllComplete || allDismissed) && !user.onboarding.is_completed) {
      user.onboarding.is_completed = true;
      user.onboarding.completed_at = new Date();
    }
    await user.save();
    return res.status(StatusCodes.OK).json({
      message: "Onboarding progress updated with success.",
      onboarding: user.onboarding,
    });
  } catch (err) {
    return next(err);
  }
};

//POST /api/v1/onboarding
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
    //save the user infor in the database
    await user.save();
    return res.status(StatusCodes.OK).json({
      message: "Onboarding tour was reset successfully.",
      onboarding: user.onboarding,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getOnboardingState,
  updateOnboardingProgress,
  resetOnboardingProgress,
};
