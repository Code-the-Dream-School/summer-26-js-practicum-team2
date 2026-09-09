const express = require("express");
const { checkAnswer } = require("../controllers/quiz.controller");

const router = express.Router();

// Immediate feedback is available to signed-out lesson previews as well as authenticated learners.
router.post("/check", checkAnswer);

module.exports = router;
