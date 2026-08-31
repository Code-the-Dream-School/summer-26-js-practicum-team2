const express = require("express");
const router = express.Router();
const {authenticateUser, authorizeRoles} = require("../middleware/jsonWebToken");
const {
  getPendingDeleteAccount,
  approveDeleteAccount,
  rejectDeleteAccount,
  reactivateUserAcct,
  getAllAdminUsers,
} = require("../controllers/admin.controller");

//Protect routes
router.use(authenticateUser, authorizeRoles("admin"));

//Admin endpoints;
//GET/api/v1/admin/users
router.get("/users", getAllAdminUsers);
// GET /api/v1/admin/deletions/pending
router.get("/deletions/pending", getPendingDeleteAccount);
//PATCH /api/v1/admin/deletions/approve/:userId
router.patch("/deletions/approve/:userId", approveDeleteAccount);
//PATCH /api/v1/admin/deletions/deny/:userId
router.patch("/deletions/deny/:userId", rejectDeleteAccount);
//PATCH /api/v1/admin/deletions/reactivate/:userId
router.patch("/deletions/reactivate/:userId", reactivateUserAcct);
module.exports = router;
