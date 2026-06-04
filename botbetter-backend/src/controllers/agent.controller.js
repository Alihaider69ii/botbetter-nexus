const { getMemory } = require("../models/Memory.model");
const User = require("../models/User.model");
const { translateText } = require("../utils/translator");
const { speechToText, textToSpeech } = require("../utils/sarvam");
const { runSellio } = require("../agents/sellio");
const { runCracky } = require("../agents/cracky");
const { runBuddy } = require("../agents/buddy");
const { runFinio } = require("../agents/finio");
const { runPrepify } = require("../agents/prepify");
const { runFlexAI } = require("../agents/flexai");
const { runCreato } = require("../agents/creato");
const { runNexus } = require("../agents/nexus");

const PLAN_LIMITS = {
  free: 100,
  starter: 500,
  basic: 1500,
  pro: 5000,
  unlimited: Infinity,
};

// Returns { canSend, messagesLeft, messagesUsed, totalLimit, resetTime }
// Resets daily counter if 24h have elapsed since lastResetDate
async function checkDailyLimit(userId) {
  const user = await User.findById(userId);
  const now = new Date();
  const lastReset = user.lastResetDate || user.createdAt;
  const elapsed = now - lastReset;

  let dailyCount = user.dailyMessageCount;

  if (elapsed >= 24 * 60 * 60 * 1000) {
    await User.findByIdAndUpdate(userId, {
      dailyMessageCount: 0,
      lastResetDate: now,
    });
    dailyCount = 0;
  }

  const totalLimit = user.dailyMessageLimit + user.bonusMessages;
  const messagesLeft = Math.max(0, totalLimit - dailyCount);
  const resetTime = new Date(
    (elapsed >= 24 * 60 * 60 * 1000 ? now : lastReset).getTime() +
      24 * 60 * 60 * 1000
  );

  return {
    canSend: messagesLeft > 0,
    messagesLeft,
    messagesUsed: dailyCount,
    totalLimit,
    resetTime,
  };
}

async function runAgent(agentName, userId, message) {
  switch (agentName) {
    case "sellio":
      return runSellio(userId, message);
    case "cracky":
      return runCracky(userId, message);
    case "buddy":
      return runBuddy(userId, message);
    case "finio":
      return runFinio(userId, message);
    case "prepify":
      return runPrepify(userId, message);
    case "flexai":
      return runFlexAI(userId, message);
    case "creato":
      return runCreato(userId, message);
    case "nexus":
      return runNexus(userId, message);
    default:
      return null;
  }
}

// @route POST /api/chat/:agentName
const chat = async (req, res, next) => {
  try {
    const { agentName } = req.params;
    const { message } = req.body;
    const userId = req.user._id;

    if (!message || message.trim() === "") {
      return res.status(400).json({ success: false, message: "Message cannot be empty" });
    }

    // Check plan lifetime limit
    const planLimit = PLAN_LIMITS[req.user.plan];
    if (req.user.messagesCount >= planLimit) {
      return res.status(403).json({
        success: false,
        message: `Message limit reached for ${req.user.plan} plan. Please upgrade!`,
        upgrade: true,
      });
    }

    // Check daily beta limit
    const limitStatus = await checkDailyLimit(userId);
    if (!limitStatus.canSend) {
      return res.status(429).json({
        success: false,
        limitReached: true,
        message: "Daily message limit reached. Come back tomorrow!",
        messagesLeft: 0,
        resetTime: limitStatus.resetTime,
      });
    }

    let reply = await runAgent(agentName, userId, message);
    if (!reply) {
      return res.status(400).json({ success: false, message: `Agent "${agentName}" not found` });
    }

    // Translate if user's preferred language is not English
    const userLang = req.user.language || "en-IN";
    if (userLang !== "en-IN" && reply) {
      try {
        reply = await translateText(reply, userLang);
      } catch (e) {
        console.error("Translation error (returning English):", e.message);
      }
    }

    // Increment both daily counter and lifetime counter
    await User.findByIdAndUpdate(userId, {
      $inc: { messagesCount: 1, tokensUsed: 100, dailyMessageCount: 1 },
    });

    res.status(200).json({
      success: true,
      agent: agentName,
      reply,
      messagesLeft: limitStatus.messagesLeft - 1,
      resetTime: limitStatus.resetTime,
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/voice/chat
const voiceChat = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const language = req.body.language || req.user.language || "en-IN";

    if (!req.file?.buffer) {
      return res.status(400).json({ success: false, message: "Audio file is required" });
    }

    const planLimit = PLAN_LIMITS[req.user.plan];
    if (req.user.messagesCount >= planLimit) {
      return res.status(403).json({
        success: false,
        message: `Message limit reached for ${req.user.plan} plan. Please upgrade!`,
        upgrade: true,
      });
    }

    const limitStatus = await checkDailyLimit(userId);
    if (!limitStatus.canSend) {
      return res.status(429).json({
        success: false,
        limitReached: true,
        message: "Daily message limit reached. Come back tomorrow!",
        messagesLeft: 0,
        resetTime: limitStatus.resetTime,
      });
    }

    const audioBlob = new Blob([req.file.buffer], {
      type: req.file.mimetype || "audio/webm",
    });
    const transcript = (await speechToText(audioBlob, language)).trim();

    if (!transcript) {
      return res.status(400).json({ success: false, message: "Could not transcribe audio" });
    }

    let reply = await runNexus(userId, transcript);
    if (language !== "en-IN" && reply) {
      try {
        reply = await translateText(reply, language);
      } catch (e) {
        console.error("Voice translation error (returning English):", e.message);
      }
    }

    const audioBase64 = await textToSpeech(reply, language);

    await User.findByIdAndUpdate(userId, {
      $inc: { messagesCount: 1, tokensUsed: 100, dailyMessageCount: 1 },
    });

    res.status(200).json({
      success: true,
      audioBase64,
      transcript,
      reply,
      messagesLeft: limitStatus.messagesLeft - 1,
      resetTime: limitStatus.resetTime,
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/history/:agentName
const getHistory = async (req, res, next) => {
  try {
    const { agentName } = req.params;
    const memory = await getMemory(req.user._id);
    const history = memory.getAgentHistory(agentName, 20);
    res.status(200).json({ success: true, agent: agentName, history });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/stats
const getStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const memory = await getMemory(req.user._id);
    const limit = PLAN_LIMITS[user.plan];
    const used = user.messagesCount;

    res.status(200).json({
      success: true,
      stats: {
        plan: user.plan,
        messagesUsed: used,
        messagesLeft: limit === Infinity ? "Unlimited" : limit - used,
        tokensUsed: user.tokensUsed,
        activeAgents: user.activeAgents,
        connectedApps: user.connectedApps,
        totalChats: memory.chatHistory.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { chat, voiceChat, getHistory, getStats };
