const { StatusCodes } = require("http-status-codes");

const modules = {
  cashFlow: require("../../../shared/content/budgeting.json"),
};

exports.getLesson = (req, res) => {
  const { moduleId, lessonId } = req.params;
  const moduleData = modules[moduleId];

  if (!moduleData) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: `Module '${moduleId}' was not found.`,
    });
  }

  const lessonData = moduleData.lessons?.find(
    (lesson) => lesson.id === lessonId,
  );

  if (!lessonData) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: `Lesson '${lessonId}' was not found in module '${moduleId}'.`,
    });
  }

  return res.status(StatusCodes.OK).json({
    moduleData,
    lessonData,
  });
};
