const { getMemory } = require("../models/Memory.model");
const User = require("../models/User.model");
const { runSellio } = require("../agents/sellio");
const { runCracky } = require("../agents/cracky");

// Plan message limits
const PLAN_LIMITS = {
  free: 100,
  starter: 500,
  basic: 1500,
  pro: 5000,
  unlimited: Infinity,
};

// Check if user can send message
const checkLimit = async (user) => {
  const limit = PLAN_LIMITS[user.plan];
  if (user.messagesCount >= limit) {
    return false;
  }
  return true;
};

// @route POST /api/chat/:agentName
const chat = async (req, res, next) => {
  try {
    const { agentName } = req.params;
    const { message } = req.body;
    const userId = req.user._id;

    // Validate message
    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    // Check plan limit
    const canChat = await checkLimit(req.user);
    if (!canChat) {
      return res.status(403).json({
        success: false,
        message: `Message limit reached for ${req.user.plan} plan. Please upgrade!`,
        upgrade: true,
      });
    }

    // Route to correct agent
    let reply;
    switch (agentName) {
      case "sellio":
        reply = await runSellio(userId, message);
        break;
      case "cracky":
        reply = await runCracky(userId, message);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: `Agent "${agentName}" not found`,
        });
    }

    // Update user stats
    await User.findByIdAndUpdate(userId, {
      $inc: { messagesCount: 1, tokensUsed: 100 },
    });

    res.status(200).json({
      success: true,
      agent: agentName,
      reply,
      messagesLeft: PLAN_LIMITS[req.user.plan] - req.user.messagesCount - 1,
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/chat/history/:agentName
const getHistory = async (req, res, next) => {
  try {
    const { agentName } = req.params;
    const userId = req.user._id;

    const memory = await getMemory(userId);
    const history = memory.getAgentHistory(agentName, 20);

    res.status(200).json({
      success: true,
      agent: agentName,
      history,
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/user/stats
const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    const memory = await getMemory(userId);

    const limit = PLAN_LIMITS[user.plan];
    const used = user.messagesCount;
    const left = limit === Infinity ? "Unlimited" : limit - used;

    res.status(200).json({
      success: true,
      stats: {
        plan: user.plan,
        messagesUsed: used,
        messagesLeft: left,
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

module.exports = { chat, getHistory, getStats };