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
//GET /api/v1/quizzes/progress
router.get("/progress", jwtMiddleware, getUserProgress);

//GET /api/v1/quizzes/attempts
//GET attempt hx for administrative analytics or user review
router.get("/attempts", jwtMiddleware, getUserAttempts);

//POST /api/v1/quizzes/start
//start a new knowledge check
router.post("/start", jwtMiddleware, startQuiz);

//Submit quiz and get score
// POST /api/v1/quizzes/:id/submit
router.post("/:id/submit", jwtMiddleware, submitQuiz);

module.exports = router;
