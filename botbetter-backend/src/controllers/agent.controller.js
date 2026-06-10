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
const { callAI, callAIStream } = require("../utils/aiCaller");
const { getNexusPrompt } = require("../agents/nexus/prompt");

function deduplicateResponse(text) {
  if (!text || typeof text !== "string") return text;
  const segments = text.split(/(?<=[.!?।\n])\s+/);
  const seen = new Set();
  const result = [];
  for (const seg of segments) {
    const key = seg.toLowerCase().trim().replace(/\s+/g, " ");
    if (key.length > 4 && seen.has(key)) continue;
    if (key.length > 4) seen.add(key);
    result.push(seg);
  }
  return result.join(" ").trim();
}

const PLAN_LIMITS = {
  free: 100,
  starter: 500,
  basic: 1500,
  pro: 5000,
  unlimited: Infinity,
};

async function checkDailyLimit(userId) {
  const user = await User.findById(userId);
  const now = new Date();
  const lastReset = user.lastResetDate || user.createdAt;
  const elapsed = now - lastReset;

  let dailyCount = user.dailyMessageCount;

  if (elapsed >= 24 * 60 * 60 * 1000) {
    await User.findByIdAndUpdate(userId, { dailyMessageCount: 0, lastResetDate: now });
    dailyCount = 0;
  }

  const totalLimit = user.dailyMessageLimit + user.bonusMessages;
  const messagesLeft = Math.max(0, totalLimit - dailyCount);
  const resetTime = new Date(
    (elapsed >= 24 * 60 * 60 * 1000 ? now : lastReset).getTime() + 24 * 60 * 60 * 1000
  );

  return { canSend: messagesLeft > 0, messagesLeft, messagesUsed: dailyCount, totalLimit, resetTime };
}

async function runAgent(agentName, userId, message, opts = {}) {
  switch (agentName) {
    case "sellio":  return runSellio(userId, message, opts);
    case "cracky":  return runCracky(userId, message, opts);
    case "buddy":   return runBuddy(userId, message, opts);
    case "finio":   return runFinio(userId, message, opts);
    case "prepify": return runPrepify(userId, message, opts);
    case "flexai":  return runFlexAI(userId, message, opts);
    case "creato":  return runCreato(userId, message, opts);
    case "nexus":   return runNexus(userId, message, opts);
    default:        return null;
  }
}

// @route POST /api/chat/:agentName
const chat = async (req, res, next) => {
  try {
    const { agentName } = req.params;
    const { message, personality, language, tts } = req.body;
    const userId = req.user._id;

    if (!message || message.trim() === "") {
      return res.status(400).json({ success: false, message: "Message cannot be empty" });
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

    const resolvedPersonality = personality || req.user.personality || "maya";
    const resolvedLanguage    = language    || req.user.language    || "en-IN";

    const opts = { personality: resolvedPersonality, language: resolvedLanguage };
    let reply = await runAgent(agentName, userId, message, opts);

    if (!reply) {
      return res.status(400).json({ success: false, message: `Agent "${agentName}" not found` });
    }

    reply = deduplicateResponse(reply);

    // Translate if needed (skip for en-IN)
    if (resolvedLanguage !== "en-IN" && reply) {
      try {
        reply = await translateText(reply, resolvedLanguage);
      } catch (e) {
        console.error("Translation error (returning English):", e.message);
      }
    }

    // Optional TTS — frontend requests this when voice mode is on
    let audioBase64 = "";
    if (tts) {
      try {
        audioBase64 = await textToSpeech(reply, resolvedLanguage, resolvedPersonality);
      } catch (e) {
        console.error("TTS error (skipping audio):", e.message);
      }
    }

    await User.findByIdAndUpdate(userId, {
      $inc: { messagesCount: 1, tokensUsed: 100, dailyMessageCount: 1 },
    });

    res.status(200).json({
      success: true,
      agent: agentName,
      reply,
      audioBase64,
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
    const language    = req.body.language    || req.user.language    || "en-IN";
    const personality = req.body.personality || req.user.personality || "maya";

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

    const audioBlob = new Blob([req.file.buffer], { type: req.file.mimetype || "audio/webm" });
    const transcript = (await speechToText(audioBlob, language)).trim();

    if (!transcript) {
      return res.status(400).json({ success: false, message: "Could not transcribe audio" });
    }

    const opts = { personality, language };
    let reply = await runNexus(userId, transcript, opts);

    if (language !== "en-IN" && reply) {
      try {
        reply = await translateText(reply, language);
      } catch (e) {
        console.error("Voice translation error (returning English):", e.message);
      }
    }

    const audioBase64 = await textToSpeech(reply, language, personality);

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
    const history = memory.getAgentHistory(agentName, 50);
    res.status(200).json({ success: true, agent: agentName, history });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/history/:agentName
const clearHistory = async (req, res, next) => {
  try {
    const { agentName } = req.params;
    const memory = await getMemory(req.user._id);
    memory.chatHistory = memory.chatHistory.filter((m) => m.agent !== agentName);
    await memory.save();
    res.status(200).json({ success: true, message: "History cleared" });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/chat/:agentName/stream  (SSE streaming — text only, no TTS)
const chatStream = async (req, res, next) => {
  try {
    const { message, personality, language } = req.body;
    const userId = req.user._id;

    if (!message || message.trim() === "") {
      return res.status(400).json({ success: false, message: "Message cannot be empty" });
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

    // Commit to SSE — no JSON errors after this point
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const resolvedPersonality = personality || req.user.personality || "maya";
    const resolvedLanguage    = language    || req.user.language    || "en-IN";

    const memory = await getMemory(userId);
    const systemPrompt = getNexusPrompt(memory, { personality: resolvedPersonality, language: resolvedLanguage });
    const history = memory.getAgentHistory("nexus", 8).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

    let fullReply = "";

    const onChunk = (delta) => {
      if (res.writableEnded) return;
      fullReply += delta;
      res.write(`data: ${JSON.stringify({ delta })}\n\n`);
    };

    try {
      await callAIStream(
        "nexus",
        [...history, { role: "user", content: message }],
        systemPrompt,
        onChunk
      );
    } catch (streamErr) {
      console.error("[Stream] AI error, falling back to non-streaming:", streamErr.message);
      if (!fullReply) {
        const result = await callAI(
          "nexus",
          [...history, { role: "user", content: message }],
          systemPrompt
        );
        fullReply = result.reply;
        if (!res.writableEnded) {
          res.write(`data: ${JSON.stringify({ delta: fullReply })}\n\n`);
        }
      }
    }

    fullReply = deduplicateResponse(fullReply);

    try {
      await memory.addMessage("nexus", "user", message);
      await memory.addMessage("nexus", "assistant", fullReply);
    } catch (e) {
      console.error("[Stream] History save error:", e.message);
    }

    await User.findByIdAndUpdate(userId, {
      $inc: { messagesCount: 1, tokensUsed: 100, dailyMessageCount: 1 },
    });

    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ done: true, messagesLeft: limitStatus.messagesLeft - 1, resetTime: limitStatus.resetTime })}\n\n`);
      res.end();
    }
  } catch (err) {
    if (!res.headersSent) {
      next(err);
    } else if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ error: "Something went wrong" })}\n\n`);
      res.end();
    }
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

module.exports = { chat, chatStream, voiceChat, getHistory, clearHistory, getStats };
