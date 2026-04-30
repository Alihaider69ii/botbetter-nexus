const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

function makeReferralCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

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
  tokensUsed: { type: Number, default: 0 },
  messagesCount: { type: Number, default: 0 },

  // Beta daily limits
  dailyMessageCount: { type: Number, default: 0 },
  dailyMessageLimit: { type: Number, default: 50 },
  lastResetDate: { type: Date, default: Date.now },
  bonusMessages: { type: Number, default: 0 },

  // Referral
  referralCode: { type: String, unique: true, sparse: true },
  referralCount: { type: Number, default: 0 },
  referredBy: { type: String, default: null },

  createdAt: { type: Date, default: Date.now },
});

userSchema.statics.generateUniqueReferralCode = async function () {
  let code, exists;
  do {
    code = makeReferralCode();
    exists = await this.findOne({ referralCode: code });
  } while (exists);
  return code;
};

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
