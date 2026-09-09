const express = require("express");
const multer = require("multer");
const importSecret = require("../middleware/importSecret");
const { importLessonModule } = require("../controllers/lesson.controller");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post("/import", importSecret, upload.single("file"), importLessonModule);

module.exports = router;
