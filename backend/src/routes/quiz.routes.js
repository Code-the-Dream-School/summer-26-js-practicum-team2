const express = require("express");
const router = express.Router();
const {
  getUserProgress,
  getUserAttempts,
  startQuiz,
  submitQuiz,
} = require("../controllers/quiz.controller");

//GET user progress from modules or specific module
router.get("/progress", getUserProgress);

//GET attempt hx for administrative analytics or user review
router.get("/attempts", getUserAttempts);

//start a new knowledge check
router.post("/start", startQuiz);

//Submit quiz and get score
router.post("/:id/submit", submitQuiz);

module.exports = router;
