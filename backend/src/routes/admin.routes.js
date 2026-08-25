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
//POST /api/v1/admin/deletions/approve/:userId
router.post("/deletions/approve/:userId", approveDeleteAccount);
//POST /api/v1/admin/deletions/deny/:userId
router.post("/deletions/deny/:userId", rejectDeleteAccount);

module.exports = router;
