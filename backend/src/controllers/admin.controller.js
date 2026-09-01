const { StatusCodes } = require("http-status-codes");
const mongoose = require("mongoose");
const User = require("../models/User.model");
const UserProgress = require("../models/UserProgress.model");
const LessonModule = require("../models/LessonModule.model");
const { clearModuleCache } = require("../utils/content");
const {
  adminActionSchema,
  adminDisableSchema,
  adminDeleteSchema,
  adminSoftDeleteSchema,
  adminRoleSchema,
  adminUserQuerySchema,
  adminModuleSchema,
  adminModuleUpdateSchema,
  adminLessonSchema,
  validateRequest,
} = require("../validation/userValidation");
const budgetingModule = require("../../../shared/content/budgeting.json");

const safeUser = (user) => ({
  _id: user._id,
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  email_verified_at: user.email_verified_at,
  is_disabled: user.is_disabled,
  disabled_at: user.disabled_at,
  deleted_at: user.deleted_at,
  deletion_scheduled_at: user.deletion_scheduled_at,
  created_at: user.created_at,
});

const getTargetUser = async (userId) => {
  if (!mongoose.isValidObjectId(userId)) return null;
  return User.findById(userId);
};

const getAllAdminUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: "admin" }).select("_id name email role created_at");
    return res.status(StatusCodes.OK).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    return next(error);
  }
};

const getAdminStatus = (req, res) => {
  return res.status(StatusCodes.OK).json({
    isAdmin: true,
    userId: req.user.id,
  });
};

const listUsers = async (req, res, next) => {
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
        .select(
          "name email role email_verified_at is_disabled disabled_at deleted_at deletion_scheduled_at created_at",
        )
        .sort({ role: 1, created_at: 1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit),
      User.countDocuments(filters),
    ]);
    return res.status(StatusCodes.OK).json({
      success: true,
      count: users.length,
      users: users.map(safeUser),
      page: query.page,
      limit: query.limit,
      total,
    });
  } catch (error) {
    return next(error);
  }
};

const getPendingDeleteAccount = async (req, res, next) => {
  try {
    const pendingDeletionRequests = await User.find({
      deletion_status: "pending",
    }).select("name email deletion_status deletion_requested_at created_at");
    return res.status(StatusCodes.OK).json({
      success: true,
      count: pendingDeletionRequests.length,
      users: pendingDeletionRequests,
    });
  } catch (error) {
    return next(error);
  }
};

const approveDeleteAccount = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, deletion_status: "pending", is_deleted: false },
      {
        $set: {
          deletion_status: "approved",
          deleted_at: new Date(),
          is_deleted: true,
          deletion_approved_by: req.user.id,
        },
        $inc: { token_version: 1 },
      },
      { new: true },
    );
    if (!updatedUser) {
      return res.status(StatusCodes.CONFLICT).json({
        message: "Deletion request is not pending.",
      });
    }
    return res.status(StatusCodes.OK).json({
      message: "Account has been approved for deletion.",
    });
  } catch (error) {
    return next(error);
  }
};

const rejectDeleteAccount = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, deletion_status: "pending", is_deleted: false },
      {
        $set: {
          deletion_status: "denied",
          is_deleted: false,
          deletion_requested_at: null,
        },
      },
      { new: true },
    );
    if (!updatedUser) {
      return res.status(StatusCodes.CONFLICT).json({
        message: "Deletion request is not pending.",
      });
    }
    return res.status(StatusCodes.OK).json({ message: "Account request for deletion rejected." });
  } catch (error) {
    return next(error);
  }
};

const reactivateUserAcct = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({
      _id: userId,
      is_deleted: true,
      is_archived: { $in: [true, false] },
    });
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "No User is found." });
    }
    if (!user.deleted_at) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "This user account is not eligible for reactivation.",
      });
    }
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const activeGracePeriod = Date.now() - new Date(user.deleted_at).getTime() <= thirtyDaysMs;
    if (!activeGracePeriod) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Grace period to reactivate account has expired. Please register again.",
      });
    }
    user.is_archived = false;
    user.deletion_status = "none";
    user.is_deleted = false;
    user.deletion_requested_at = null;
    user.deleted_at = null;
    user.token_version = (user.token_version || 0) + 1;
    await user.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "User account has been reactivated.",
    });
  } catch (error) {
    return next(error);
  }
};

const resetUserProgress = async (req, res, next) => {
  try {
    const body = validateRequest(res, adminSoftDeleteSchema, req.body);
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

const verifyUserEmail = async (req, res, next) => {
  try {
    const body = validateRequest(res, adminActionSchema, req.body);
    if (!body) return;
    const target = await getTargetUser(req.params.userId);
    if (!target || target.deleted_at) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found." });
    }
    if (target._id.equals(req.user.id)) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "You cannot manage your own account." });
    }
    if (target.email_verified_at) {
      return res.status(StatusCodes.CONFLICT).json({ message: "User email is already verified." });
    }
    target.email_verified_at = new Date();
    target.verification_token = null;
    target.verification_token_expires_at = null;
    await target.save();
    return res.status(StatusCodes.OK).json(safeUser(target));
  } catch (error) {
    return next(error);
  }
};

const setUserDeleted = async (req, res, next) => {
  try {
    const body = validateRequest(res, adminSoftDeleteSchema, req.body);
    if (!body) return;
    const target = await getTargetUser(req.params.userId);
    if (!target) return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found." });
    if (target._id.equals(req.user.id)) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "You cannot manage your own account." });
    }
    if (target.role === "admin" && !target.deleted_at) {
      const activeAdmins = await User.countDocuments({
        role: "admin",
        is_disabled: false,
        deleted_at: null,
      });
      if (activeAdmins <= 1) {
        return res
          .status(StatusCodes.CONFLICT)
          .json({ message: "The last active admin cannot be deleted." });
      }
    }
    target.deleted_at = body.deleted ? new Date() : null;
    target.deletion_scheduled_at = target.deleted_at
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : null;
    await target.save();
    return res.status(StatusCodes.OK).json(safeUser(target));
  } catch (error) {
    return next(error);
  }
};

const hardDeleteUser = async (req, res, next) => {
  try {
    const body = validateRequest(res, adminDeleteSchema, req.body);
    if (!body) return;
    const target = await getTargetUser(req.params.userId);
    if (!target || target.email !== body.email) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found." });
    }
    if (target._id.equals(req.user.id)) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "You cannot manage your own account." });
    }
    if (target.role === "admin") {
      const activeAdmins = await User.countDocuments({
        role: "admin",
        is_disabled: false,
        deleted_at: null,
      });
      if (activeAdmins <= 1) {
        return res
          .status(StatusCodes.CONFLICT)
          .json({ message: "The last active admin cannot be deleted." });
      }
    }
    await UserProgress.deleteMany({ user_id: target._id });
    await User.deleteOne({ _id: target._id });
    return res.status(StatusCodes.OK).json({ message: "User permanently deleted." });
  } catch (error) {
    return next(error);
  }
};

const setUserDisabled = async (req, res, next) => {
  try {
    const body = validateRequest(res, adminDisableSchema, req.body);
    if (!body) return;
    const target = await getTargetUser(req.params.userId);
    if (!target || target.deleted_at) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found." });
    }
    if (target._id.equals(req.user.id)) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "You cannot manage your own account." });
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

const updateUserRole = async (req, res, next) => {
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

const listModules = async (req, res, next) => {
  try {
    const modules = await LessonModule.find({}).select("id title lessons").sort({ id: 1 }).lean();
    return res.status(StatusCodes.OK).json({
      modules: modules.map((module) => ({ ...module, lessonCount: module.lessons?.length ?? 0 })),
    });
  } catch (error) {
    return next(error);
  }
};

const getModule = async (req, res, next) => {
  try {
    const module = await LessonModule.findOne({ id: req.params.moduleId }).lean();
    if (!module) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Lesson module not found." });
    }
    return res.status(StatusCodes.OK).json(module);
  } catch (error) {
    return next(error);
  }
};

const createModule = async (req, res, next) => {
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

const updateModule = async (req, res, next) => {
  try {
    const body = validateRequest(res, adminModuleUpdateSchema, req.body);
    if (!body) return;
    const module = await LessonModule.findOneAndUpdate(
      { id: req.params.moduleId },
      { $set: body },
      { returnDocument: "after" },
    ).lean();
    if (!module) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Lesson module not found." });
    }
    clearModuleCache(req.params.moduleId);
    return res.status(StatusCodes.OK).json(module);
  } catch (error) {
    return next(error);
  }
};

const deleteModule = async (req, res, next) => {
  try {
    const result = await LessonModule.deleteOne({ id: req.params.moduleId });
    if (!result.deletedCount) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Lesson module not found." });
    }
    clearModuleCache(req.params.moduleId);
    return res.status(StatusCodes.OK).json({ message: "Lesson module deleted." });
  } catch (error) {
    return next(error);
  }
};

const seedBudgetingModule = async (req, res, next) => {
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

const createLesson = async (req, res, next) => {
  try {
    const body = validateRequest(res, adminLessonSchema, req.body);
    if (!body) return;
    const module = await LessonModule.findOne({ id: req.params.moduleId });
    if (!module) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Lesson module not found." });
    }
    if ((module.lessons || []).some((lesson) => lesson.id === body.id)) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "Lesson already exists in this module." });
    }
    module.lessons = [...(module.lessons || []), body];
    await module.save();
    clearModuleCache(module.id);
    return res.status(StatusCodes.CREATED).json(body);
  } catch (error) {
    return next(error);
  }
};

const updateLesson = async (req, res, next) => {
  try {
    const body = validateRequest(res, adminLessonSchema, req.body);
    if (!body) return;
    const module = await LessonModule.findOne({ id: req.params.moduleId });
    if (!module) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Lesson module not found." });
    }
    const index = (module.lessons || []).findIndex((lesson) => lesson.id === req.params.lessonId);
    if (index < 0) return res.status(StatusCodes.NOT_FOUND).json({ message: "Lesson not found." });
    if (body.id !== req.params.lessonId && module.lessons.some((lesson) => lesson.id === body.id)) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "Lesson already exists in this module." });
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

const deleteLesson = async (req, res, next) => {
  try {
    const module = await LessonModule.findOne({ id: req.params.moduleId });
    if (!module) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Lesson module not found." });
    }
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

module.exports = {
  getAllAdminUsers,
  getAdminStatus,
  listUsers,
  getPendingDeleteAccount,
  approveDeleteAccount,
  rejectDeleteAccount,
  reactivateUserAcct,
  resetUserProgress,
  verifyUserEmail,
  setUserDeleted,
  hardDeleteUser,
  setUserDisabled,
  updateUserRole,
  listModules,
  getModule,
  createModule,
  updateModule,
  deleteModule,
  seedBudgetingModule,
  createLesson,
  updateLesson,
  deleteLesson,
};
