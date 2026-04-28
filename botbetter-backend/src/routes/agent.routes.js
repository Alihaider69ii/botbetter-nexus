const express = require("express");
const router = express.Router();
const { chat, getHistory, getStats } = require("../controllers/agent.controller");
const { protect } = require("../middleware/auth.middleware");
const { chatLimiter } = require("../middleware/rateLimit.middleware");

// Chat with agent
router.post("/chat/:agentName", protect, chatLimiter, chat);

// Get chat history
router.get("/history/:agentName", protect, getHistory);

// Get user stats
router.get("/stats", protect, getStats);

module.exports = router;