require("dotenv").config();

const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 3001,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:8080",

  // Legacy single key (kept for backward compat)
  GROQ_API_KEY: process.env.GROQ_API_KEY,

  // Per-agent provider keys
  GEMINI_CRACKY: process.env.GEMINI_CRACKY,
  GROQ_CRACKY: process.env.GROQ_CRACKY,
  MISTRAL_CRACKY: process.env.MISTRAL_CRACKY,
  TOGETHER_CRACKY: process.env.TOGETHER_CRACKY,
  DEEPSEEK_CRACKY: process.env.DEEPSEEK_CRACKY,

  GEMINI_SELLIO: process.env.GEMINI_SELLIO,
  GROQ_SELLIO: process.env.GROQ_SELLIO,
  MISTRAL_SELLIO: process.env.MISTRAL_SELLIO,
  TOGETHER_SELLIO: process.env.TOGETHER_SELLIO,
  DEEPSEEK_SELLIO: process.env.DEEPSEEK_SELLIO,
};

const required = ["MONGODB_URI", "JWT_SECRET"];
required.forEach((key) => {
  if (!config[key]) {
    throw new Error(`Missing required env variable: ${key}`);
  }
});

module.exports = config;
