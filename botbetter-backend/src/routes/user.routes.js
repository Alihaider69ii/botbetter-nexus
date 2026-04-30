const express = require("express");
const router = express.Router();
const { applyReferral, getLimitStatus } = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/apply-referral", protect, applyReferral);
router.get("/limit-status", protect, getLimitStatus);

module.exports = router;
