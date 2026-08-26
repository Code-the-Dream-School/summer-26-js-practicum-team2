const express = require("express");
const router = express.Router();
const {authenticateUser, authorizeRoles} = require("../middleware/jsonWebToken");
const {
  getPendingDeleteAccount,
  approveDeleteAccount,
  rejectDeleteAccount,
} = require("../controllers/admin.controller");

//Protect routes
router.use(authenticateUser, authorizeRoles("admin"));

//Admin endpoints;
// GET /api/v1/admin/deletions/pending
router.get("/deletions/pending", getPendingDeleteAccount);
//PATCH /api/v1/admin/deletions/approve/:userId
router.patch("/deletions/approve/:userId", approveDeleteAccount);
//PATCH /api/v1/admin/deletions/deny/:userId
router.patch("/deletions/deny/:userId", rejectDeleteAccount);

module.exports = router;
