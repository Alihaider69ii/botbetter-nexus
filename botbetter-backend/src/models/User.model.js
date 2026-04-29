const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 6,
    select: false,
  },
  plan: {
    type: String,
    enum: ["free", "starter", "basic", "pro", "unlimited"],
    default: "free",
  },
  connectedApps: [{
    type: String,
    enum: ["whatsapp", "gmail", "calendar", "telegram", "slack"],
  }],
  activeAgents: [{
    type: String,
    enum: ["nexus", "buddy", "prepify", "sellio", "creato", "finio", "cracky", "flexai"],
  }],
  tokensUsed: {
    type: Number,
    default: 0,
  },
  messagesCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
// Mongoose 9+ async pre-hooks must NOT call next() — just return or throw
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);