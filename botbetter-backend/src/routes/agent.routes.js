const express = require("express");
const multer = require("multer");
const router = express.Router();
const { chat, voiceChat, getHistory, getStats } = require("../controllers/agent.controller");
const { protect } = require("../middleware/auth.middleware");
const { chatLimiter } = require("../middleware/rateLimit.middleware");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
});

// Chat with agent
router.post("/chat/:agentName", protect, chatLimiter, chat);

// Voice-to-voice chat through Nexus
router.post("/voice/chat", protect, chatLimiter, upload.single("audio"), voiceChat);

// Get chat history
router.get("/history/:agentName", protect, getHistory);

// Get user stats
router.get("/stats", protect, getStats);

module.exports = router;
