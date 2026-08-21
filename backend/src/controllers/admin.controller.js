const { StatusCodes } = require("http-status-codes");
const mongoose = require("mongoose");
const User = require("../models/User.model");
const UserProgress = require("../models/UserProgress.model");
const LessonModule = require("../models/LessonModule.model");
const { clearModuleCache } = require("../utils/content");
const {
  adminActionSchema,
  adminDisableSchema,
  adminRoleSchema,
  adminUserQuerySchema,
  adminModuleSchema,
  adminModuleUpdateSchema,
  adminLessonSchema,
  validateRequest,
} = require("../validation/userValidation");

const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  email_verified_at: user.email_verified_at,
  is_disabled: user.is_disabled,
  disabled_at: user.disabled_at,
  deleted_at: user.deleted_at,
  created_at: user.created_at,
});

const getTargetUser = async (userId) => {
  if (!mongoose.isValidObjectId(userId)) return null;
  return User.findById(userId);
};

exports.getAdminStatus = (req, res) => {
  return res.status(StatusCodes.OK).json({
    isAdmin: true,
    userId: req.user.id,
  });
};

exports.listUsers = async (req, res, next) => {
  try {
    const query = validateRequest(res, adminUserQuerySchema, req.query);
    if (!query) return;
    const filters = {};
    if (query.role) filters.role = query.role;
    if (query.emailVerified !== undefined) {
      filters.email_verified_at = query.emailVerified ? { $ne: null } : null;
    }
    if (query.search) {
      filters.$or = [
        { email: { $regex: query.search, $options: "i" } },
        { name: { $regex: query.search, $options: "i" } },
      ];
    }
    const [users, total] = await Promise.all([
      User.find(filters)
        .select("name email role email_verified_at is_disabled disabled_at deleted_at created_at")
        .sort({ created_at: 1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit),
      User.countDocuments(filters),
    ]);
    return res.status(StatusCodes.OK).json({
      users: users.map(safeUser),
      page: query.page,
      limit: query.limit,
      total,
    });
  } catch (error) {
    return next(error);
  }
};

exports.resetUserProgress = async (req, res, next) => {
  try {
    const body = validateRequest(res, adminDisableSchema, req.body);
    if (!body) return;
    const target = await getTargetUser(req.params.userId);
    if (!target || target.deleted_at) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found." });
    }
    await UserProgress.deleteMany({ user_id: target._id });
    return res.status(StatusCodes.OK).json({ message: "User progress reset." });
  } catch (error) {
    return next(error);
  }
};

exports.setUserDisabled = async (req, res, next) => {
  try {
    const body = validateRequest(res, adminActionSchema, req.body);
    if (!body) return;
    const target = await getTargetUser(req.params.userId);
    if (!target || target.deleted_at) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found." });
    }
    if (target.role === "admin" && body.disabled) {
      const activeAdmins = await User.countDocuments({
        role: "admin",
        is_disabled: false,
        deleted_at: null,
      });
      if (activeAdmins <= 1) {
        return res
          .status(StatusCodes.CONFLICT)
          .json({ message: "The last active admin cannot be disabled." });
      }
    }
    target.is_disabled = body.disabled;
    target.disabled_at = target.is_disabled ? new Date() : null;
    await target.save();
    return res.status(StatusCodes.OK).json(safeUser(target));
  } catch (error) {
    return next(error);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const body = validateRequest(res, adminRoleSchema, req.body);
    if (!body) return;
    const target = await getTargetUser(req.params.userId);
    if (!target || target.deleted_at) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found." });
    }
    if (target._id.equals(req.user.id) && body.role !== "admin") {
      return res.status(StatusCodes.CONFLICT).json({ message: "You cannot demote yourself." });
    }
    if (target.role === "admin" && body.role !== "admin") {
      const activeAdmins = await User.countDocuments({
        role: "admin",
        is_disabled: false,
        deleted_at: null,
      });
      if (activeAdmins <= 1) {
        return res
          .status(StatusCodes.CONFLICT)
          .json({ message: "The last active admin cannot be demoted." });
      }
    }
    target.role = body.role;
    await target.save();
    return res.status(StatusCodes.OK).json(safeUser(target));
  } catch (error) {
    return next(error);
  }
};

const budgetingModule = require("../../../shared/content/budgeting.json");

exports.listModules = async (req, res, next) => {
  try {
    const modules = await LessonModule.find({}).select("id title lessons").sort({ id: 1 }).lean();
    return res.status(StatusCodes.OK).json({
      modules: modules.map((module) => ({ ...module, lessonCount: module.lessons?.length ?? 0 })),
    });
  } catch (error) {
    return next(error);
  }
};

exports.getModule = async (req, res, next) => {
  try {
    const module = await LessonModule.findOne({ id: req.params.moduleId }).lean();
    if (!module) return res.status(StatusCodes.NOT_FOUND).json({ message: "Lesson module not found." });
    return res.status(StatusCodes.OK).json(module);
  } catch (error) {
    return next(error);
  }
};

exports.createModule = async (req, res, next) => {
  try {
    const body = validateRequest(res, adminModuleSchema, req.body);
    if (!body) return;
    if (await LessonModule.exists({ id: body.id })) {
      return res.status(StatusCodes.CONFLICT).json({ message: "Lesson module already exists." });
    }
    const module = await LessonModule.create(body);
    clearModuleCache(body.id);
    return res.status(StatusCodes.CREATED).json(module);
  } catch (error) {
    return next(error);
  }
};

exports.updateModule = async (req, res, next) => {
  try {
    const body = validateRequest(res, adminModuleUpdateSchema, req.body);
    if (!body) return;
    const module = await LessonModule.findOneAndUpdate(
      { id: req.params.moduleId },
      { $set: body },
      { returnDocument: "after" },
    ).lean();
    if (!module) return res.status(StatusCodes.NOT_FOUND).json({ message: "Lesson module not found." });
    clearModuleCache(req.params.moduleId);
    return res.status(StatusCodes.OK).json(module);
  } catch (error) {
    return next(error);
  }
};

exports.deleteModule = async (req, res, next) => {
  try {
    const result = await LessonModule.deleteOne({ id: req.params.moduleId });
    if (!result.deletedCount) return res.status(StatusCodes.NOT_FOUND).json({ message: "Lesson module not found." });
    clearModuleCache(req.params.moduleId);
    return res.status(StatusCodes.OK).json({ message: "Lesson module deleted." });
  } catch (error) {
    return next(error);
  }
};

exports.seedBudgetingModule = async (req, res, next) => {
  try {
    if (await LessonModule.exists({ id: budgetingModule.id })) {
      return res.status(StatusCodes.CONFLICT).json({ message: "Lesson module already exists." });
    }
    const module = await LessonModule.create(budgetingModule);
    clearModuleCache(budgetingModule.id);
    return res.status(StatusCodes.CREATED).json(module);
  } catch (error) {
    return next(error);
  }
};

exports.createLesson = async (req, res, next) => {
  try {
    const body = validateRequest(res, adminLessonSchema, req.body);
    if (!body) return;
    const module = await LessonModule.findOne({ id: req.params.moduleId });
    if (!module) return res.status(StatusCodes.NOT_FOUND).json({ message: "Lesson module not found." });
    if ((module.lessons || []).some((lesson) => lesson.id === body.id)) {
      return res.status(StatusCodes.CONFLICT).json({ message: "Lesson already exists in this module." });
    }
    module.lessons = [...(module.lessons || []), body];
    await module.save();
    clearModuleCache(module.id);
    return res.status(StatusCodes.CREATED).json(body);
  } catch (error) {
    return next(error);
  }
};

exports.updateLesson = async (req, res, next) => {
  try {
    const body = validateRequest(res, adminLessonSchema, req.body);
    if (!body) return;
    const module = await LessonModule.findOne({ id: req.params.moduleId });
    if (!module) return res.status(StatusCodes.NOT_FOUND).json({ message: "Lesson module not found." });
    const index = (module.lessons || []).findIndex((lesson) => lesson.id === req.params.lessonId);
    if (index < 0) return res.status(StatusCodes.NOT_FOUND).json({ message: "Lesson not found." });
    if (body.id !== req.params.lessonId && module.lessons.some((lesson) => lesson.id === body.id)) {
      return res.status(StatusCodes.CONFLICT).json({ message: "Lesson already exists in this module." });
    }
    module.lessons[index] = body;
    module.markModified("lessons");
    await module.save();
    clearModuleCache(module.id);
    return res.status(StatusCodes.OK).json(body);
  } catch (error) {
    return next(error);
  }
};

exports.deleteLesson = async (req, res, next) => {
  try {
    const module = await LessonModule.findOne({ id: req.params.moduleId });
    if (!module) return res.status(StatusCodes.NOT_FOUND).json({ message: "Lesson module not found." });
    if (!(module.lessons || []).some((lesson) => lesson.id === req.params.lessonId)) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Lesson not found." });
    }
    module.lessons = module.lessons.filter((lesson) => lesson.id !== req.params.lessonId);
    await module.save();
    clearModuleCache(module.id);
    return res.status(StatusCodes.OK).json({ message: "Lesson deleted." });
  } catch (error) {
    return next(error);
  }
};
