const User = require("../models/User.model");

// @route POST /api/user/apply-referral
const applyReferral = async (req, res, next) => {
  try {
    const { code } = req.body;
    const userId = req.user._id;

    if (!code) {
      return res.status(400).json({ success: false, message: "Referral code is required" });
    }

    const currentUser = await User.findById(userId);

    if (currentUser.referredBy) {
      return res.status(400).json({ success: false, message: "You have already used a referral code" });
    }

    if (currentUser.referralCode === code.toUpperCase()) {
      return res.status(400).json({ success: false, message: "You cannot use your own referral code" });
    }

    const referrer = await User.findOne({ referralCode: code.toUpperCase() });
    if (!referrer) {
      return res.status(404).json({ success: false, message: "Invalid referral code" });
    }

    // Give both users +20 bonus messages
    await User.findByIdAndUpdate(userId, {
      referredBy: code.toUpperCase(),
      $inc: { bonusMessages: 20 },
    });

    await User.findByIdAndUpdate(referrer._id, {
      $inc: { bonusMessages: 20, referralCount: 1 },
    });

    const updated = await User.findById(userId);
    const totalLimit = updated.dailyMessageLimit + updated.bonusMessages;

    res.status(200).json({
      success: true,
      message: "Referral applied! You and your friend both got +20 bonus messages.",
      bonusMessages: updated.bonusMessages,
      totalDailyLimit: totalLimit,
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/user/limit-status
const getLimitStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const now = new Date();
    const lastReset = user.lastResetDate || user.createdAt;
    const elapsed = now - lastReset;

    let dailyCount = user.dailyMessageCount;

    // Reflect reset if 24h passed (don't persist here — chat endpoint handles the write)
    if (elapsed >= 24 * 60 * 60 * 1000) {
      dailyCount = 0;
    }

    const totalLimit = user.dailyMessageLimit + user.bonusMessages;
    const messagesLeft = Math.max(0, totalLimit - dailyCount);
    const resetTime = new Date(
      (elapsed >= 24 * 60 * 60 * 1000 ? now : lastReset).getTime() +
        24 * 60 * 60 * 1000
    );

    res.status(200).json({
      success: true,
      messagesUsed: dailyCount,
      messagesLeft,
      totalLimit,
      resetTime,
      referralCode: user.referralCode,
      referralCount: user.referralCount,
      bonusMessages: user.bonusMessages,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { applyReferral, getLimitStatus };
