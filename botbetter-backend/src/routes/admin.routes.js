const express = require("express");
const router = express.Router();
const { getUsage } = require("../controllers/admin.controller");
const { protect } = require("../middleware/auth.middleware");

// GET /api/admin/usage — daily provider usage summary
router.get("/usage", protect, getUsage);

module.exports = router;
