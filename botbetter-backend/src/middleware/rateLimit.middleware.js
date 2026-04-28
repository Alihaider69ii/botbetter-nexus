const rateLimit = require("express-rate-limit");

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: "Too many requests — please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limit — stricter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many login attempts — please try again after 15 minutes",
  },
});

// Chat rate limit — per plan
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: {
    success: false,
    message: "Too many messages — slow down!",
  },
});

module.exports = { apiLimiter, authLimiter, chatLimiter };