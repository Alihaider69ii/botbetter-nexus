const express = require("express");
const router = express.Router();
const { applyReferral, getLimitStatus, updateOnboarding } = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/apply-referral", protect, applyReferral);
router.get("/limit-status", protect, getLimitStatus);
router.put("/onboarding", protect, updateOnboarding);

module.exports = router;
