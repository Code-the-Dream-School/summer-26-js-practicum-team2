const express = require("express");
const { getAdminStatus } = require("../controllers/admin.controller");

const router = express.Router();

router.get("/status", getAdminStatus);

module.exports = router;