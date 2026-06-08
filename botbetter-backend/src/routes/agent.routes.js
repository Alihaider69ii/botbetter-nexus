const express = require("express");
const multer = require("multer");
const router = express.Router();
const { chat, voiceChat, getHistory, clearHistory, getStats } = require("../controllers/agent.controller");
const { protect } = require("../middleware/auth.middleware");
const { chatLimiter } = require("../middleware/rateLimit.middleware");
const { textToSpeech } = require("../utils/sarvam");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
});

const MAYA_INTRO = "Hi! I am Maya, your personal AI from BotBetter. I am powered by Nexus, India's first agentic AI. I can manage your schedule, send WhatsApp messages, help you prepare for exams, grow your business, create content, manage finances, and much more. All in your language. All with just one command. Click Login to access my full capabilities.";
const KABIR_INTRO = "Kabir here. BotBetter's execution engine. Give me a command, I'll get it done. Simultaneously. In real time. Schedule, research, sell, create, learn. One platform. Infinite actions. Login to begin.";

// Public voice intro — no auth required
router.post("/voice/intro", async (req, res) => {
  const { personality = "maya" } = req.body;
  const text = personality === "kabir" ? KABIR_INTRO : MAYA_INTRO;
  try {
    const audioBase64 = await textToSpeech(text, "en-IN", personality);
    if (!audioBase64) {
      console.error("[VoiceIntro] TTS returned empty audio for personality:", personality);
      return res.status(500).json({ success: false, message: "Voice unavailable" });
    }
    res.json({ success: true, audioBase64 });
  } catch (e) {
    console.error("[VoiceIntro] TTS failed for personality", personality, ":", e.message);
    res.status(500).json({ success: false, message: "Voice unavailable" });
  }
});

// Chat with agent
router.post("/chat/:agentName", protect, chatLimiter, chat);

// Voice-to-voice chat through Nexus
router.post("/voice/chat", protect, chatLimiter, upload.single("audio"), voiceChat);

// Get chat history
router.get("/history/:agentName", protect, getHistory);

// Clear chat history for an agent
router.delete("/history/:agentName", protect, clearHistory);

// Get user stats
router.get("/stats", protect, getStats);

module.exports = router;
