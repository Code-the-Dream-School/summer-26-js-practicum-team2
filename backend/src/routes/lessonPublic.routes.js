const express = require("express");
const { getPublicLesson } = require("../controllers/lesson.controller");

const router = express.Router();

router.get("/public/:moduleId/:lessonId", getPublicLesson);

module.exports = router;
