const express = require("express");
const importSecret = require("../middleware/importSecret");
const { importLessonModule } = require("../controllers/lesson.controller");

const router = express.Router();

router.post("/import", importSecret, importLessonModule);

module.exports = router;
