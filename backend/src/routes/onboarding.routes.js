const express = require("express");
const router = express.Router();
const {
  getOnboardingState,
  updateOnboardingProgress,
  resetOnboardingProgress,
  toggleOnboardingWorkflow,
} = require("../controllers/onboarding.controller");

const jwtMiddleware = require("../middleware/jsonWebToken");

router.use(jwtMiddleware);

//GET /api/v1/onboarding
router.get("/", getOnboardingState);
//POST /api/v1/onboarding/toggle
router.post("/toggle", toggleOnboardingWorkflow);

//PATCH /api/v1/onboarding/step
router.patch("/step", updateOnboardingProgress);

//POST /api/v1/onboarding/reset
router.post("/reset", resetOnboardingProgress);

module.exports = router;
