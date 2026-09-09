const express = require("express");
const { getDashboard, trackDashboardEvent } = require("../controllers/dashboard.controller");

const router = express.Router();

router.get("/", getDashboard);
router.post("/events", trackDashboardEvent);

module.exports = router;
