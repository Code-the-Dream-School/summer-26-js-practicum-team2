const express = require("express");
const router = express.Router();
const {
  beginOnboarding,
  getOnboardingState,
  updateOnboardingProgress,
  resetOnboardingProgress,
  toggleOnboardingWorkflow,
} = require("../controllers/onboarding.controller");

const jwtMiddleware = require("../middleware/jsonWebToken");

router.use(jwtMiddleware);

//GET /api/v1/onboarding/begin Get initial default tour structure of the object 
router.get("/begin", beginOnboarding);

//PATCH /api/v1/onboarding/toggle
router.patch("/toggle", toggleOnboardingWorkflow);

//PATCH /api/v1/onboarding/step
router.patch("/step", updateOnboardingProgress);

//POST /api/v1/onboarding/reset
router.post("/reset", resetOnboardingProgress);

//GET /api/v1/onboarding
router.get("/", getOnboardingState);
module.exports = router;
