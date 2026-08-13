const express = require("express");
const jwtMiddleware = require("../middleware/jsonWebToken");
const {
  getDashboard,
  trackDashboardEvent,
} = require("../controllers/dashboard.controller");

const router = express.Router();

router.get("/", jwtMiddleware, getDashboard);
router.post("/events", jwtMiddleware, trackDashboardEvent);

module.exports = router;
