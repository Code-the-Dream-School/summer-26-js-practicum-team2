const express = require("express");
const jwtMiddleware = require("../middleware/jwtMiddleware");
const { getLesson } = require("../controllers/lessonController");

const router = express.Router();

router.get("/:moduleId/:lessonId", jwtMiddleware, getLesson);

module.exports = router;
