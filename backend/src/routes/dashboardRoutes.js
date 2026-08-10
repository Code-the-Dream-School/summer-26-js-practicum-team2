const express = require("express");
const jwtMiddleware = require("../middleware/jwtMiddleware");
const {
  getDashboard,
  trackDashboardEvent,
} = require("../controllers/dashboardController");

const router = express.Router();

router.get("/", jwtMiddleware, getDashboard);
router.post("/events", jwtMiddleware, trackDashboardEvent);

module.exports = router;
