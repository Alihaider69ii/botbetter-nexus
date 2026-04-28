require("dotenv").config();

const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 3001,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:8080",
};

const required = ["MONGODB_URI", "JWT_SECRET", "GROQ_API_KEY"];
required.forEach((key) => {
  if (!config[key]) {
    throw new Error(`❌ Missing required env variable: ${key}`);
  }
});

module.exports = config;