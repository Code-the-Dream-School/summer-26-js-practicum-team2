const express = require("express");
const router = express.Router();
const {
  getUserProgress,
  getUserAttempts,
  startQuiz,
  submitQuiz,
} = require("../controllers/quizController");
const jwtMiddleware = require("../middleware/jwtMiddleware");

//GET user progress from modules or specific module
router.get("/progress", jwtMiddleware, getUserProgress);

//GET attempt hx for administrative analytics or user review
router.get("/attempts", jwtMiddleware, getUserAttempts);

//start a new knowledge check
router.post("/start", jwtMiddleware, startQuiz);

//Submit quiz and get score
router.post("/:id/submit", jwtMiddleware, submitQuiz);

module.exports = router;
