const mongoose = require("mongoose");

const memorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  name: String,
  city: String,
  language: { type: String, default: "hinglish" },

  // Sellio data
  ecommerce: {
    platform: String,
    products: [{
      name: String,
      price: Number,
      category: String,
      createdAt: { type: Date, default: Date.now },
    }],
    keywords: [String],
  },

  // Cracky data
  education: {
    exam: String,
    examDate: Date,
    weakChapters: [String],
    completedTopics: [String],
    dailyScores: [{
      date: { type: Date, default: Date.now },
      score: Number,
      topic: String,
    }],
    studyStreak: { type: Number, default: 0 },
  },

  // Prepify data
  career: {
    targetCompany: String,
    targetRole: String,
    experienceLevel: String,
    weakTopics: [String],
    mockScores: [{
      date: { type: Date, default: Date.now },
      score: Number,
      topic: String,
    }],
  },

  // FlexAI data
  fitness: {
    weight: Number,
    height: Number,
    goal: String,
    dietPreference: String,
    workoutHistory: [{
      date: { type: Date, default: Date.now },
      workout: String,
      duration: Number,
    }],
  },

  // Chat history — all agents
  chatHistory: [{
    agent: {
      type: String,
      enum: ["nexus", "buddy", "prepify", "sellio", "creato", "finio", "cracky", "flexai"],
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
    },
    content: String,
    tokens: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  }],

  updatedAt: { type: Date, default: Date.now },
});

// Auto update updatedAt — no next() needed in Mongoose 9
memorySchema.pre("save", function () {
  this.updatedAt = new Date();
});

// Get history for specific agent
memorySchema.methods.getAgentHistory = function (agentName, limit = 10) {
  return this.chatHistory
    .filter((m) => m.agent === agentName)
    .slice(-limit);
};

// Add message to history
memorySchema.methods.addMessage = async function (agent, role, content, tokens = 0) {
  this.chatHistory.push({ agent, role, content, tokens });
  if (this.chatHistory.length > 100) {
    this.chatHistory = this.chatHistory.slice(-100);
  }
  await this.save();
};

const Memory = mongoose.model("Memory", memorySchema);

async function getMemory(userId) {
  let mem = await Memory.findOne({ userId });
  if (!mem) mem = await Memory.create({ userId });
  return mem;
}

module.exports = { Memory, getMemory };