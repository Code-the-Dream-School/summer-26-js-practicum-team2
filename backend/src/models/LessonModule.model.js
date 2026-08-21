const mongoose = require("mongoose");

const lessonModuleSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    lessons: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { strict: false },
);

module.exports = mongoose.model("LessonModule", lessonModuleSchema);
