const express = require("express");
const { checkAnswer } = require("../controllers/quiz.controller");

const router = express.Router();

router.post("/check", checkAnswer);

module.exports = router;
