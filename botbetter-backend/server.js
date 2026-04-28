const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { connect } = require("./src/config/db");
const config = require("./src/config/env");
const authRoutes = require("./src/routes/auth.routes");
const agentRoutes = require("./src/routes/agent.routes");
const { apiLimiter } = require("./src/middleware/rateLimit.middleware");
const { errorHandler } = require("./src/middleware/error.middleware");

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true,
}));

// Logging
app.use(morgan(config.NODE_ENV === "development" ? "dev" : "combined"));

// Body parser
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use("/api", apiLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", agentRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "BotBetter backend is running!",
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handler
app.use(errorHandler);

// Start server
const start = async () => {
  try {
    await connect();
    app.listen(config.PORT, () => {
      console.log(`🚀 BotBetter backend running on port ${config.PORT}`);
      console.log(`🌍 Environment: ${config.NODE_ENV}`);
      console.log(`✅ Health check: http://localhost:${config.PORT}/health`);
    });
  } catch (err) {
    console.error("❌ Server failed to start:", err.message);
    process.exit(1);
  }
};

start();