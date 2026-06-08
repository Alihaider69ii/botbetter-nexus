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

const MAYA_INTRO = "Hey! Maya here, your AI best friend from BotBetter! Yaar, imagine a friend who sends your WhatsApp messages, preps you for NEET, helps you sell more on Meesho, creates your Instagram reels, manages your budget, and plans your whole week. All at the same time! In Hindi, English, Hinglish, whatever feels like home. That is me. Powered by Nexus, India's first agentic AI. Come on, click Login and let us get things done together!";
const KABIR_INTRO = "Yo! Kabir here, the execution guy at BotBetter! You talk, I deliver. Schedule your week? Done. Research trending products? Done. Send messages, create content, prep for interviews, manage your money? All done. Simultaneously. While you chill. Connected to WhatsApp, Gmail, Instagram, Meesho, Zerodha and more. Ten Indian languages. No delays, no excuses. BotBetter is India's first agentic AI and bhai, you will love it. Hit Login. Let us go!";

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
