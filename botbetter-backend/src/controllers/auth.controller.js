const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const { getMemory } = require("../models/Memory.model");
const config = require("../config/env");

const generateToken = (id) => jwt.sign({ id }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });

// @route POST /api/auth/signup
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const referralCode = await User.generateUniqueReferralCode();
    const user = await User.create({ name, email, password, referralCode });

    await getMemory(user._id);

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        referralCode: user.referralCode,
        dailyMessageLimit: user.dailyMessageLimit,
        bonusMessages: user.bonusMessages,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        activeAgents: user.activeAgents,
        connectedApps: user.connectedApps,
        referralCode: user.referralCode,
        dailyMessageLimit: user.dailyMessageLimit,
        bonusMessages: user.bonusMessages,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        activeAgents: user.activeAgents,
        connectedApps: user.connectedApps,
        tokensUsed: user.tokensUsed,
        messagesCount: user.messagesCount,
        referralCode: user.referralCode,
        referralCount: user.referralCount,
        bonusMessages: user.bonusMessages,
        dailyMessageLimit: user.dailyMessageLimit,
        dailyMessageCount: user.dailyMessageCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, getMe };
