const mongoose = require("mongoose");

function getISTDateString() {
  const now = new Date();
  const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return istTime.toISOString().split("T")[0]; // YYYY-MM-DD
}

const apiUsageSchema = new mongoose.Schema(
  {
    providerId: { type: String, required: true },
    agentName: { type: String, required: true },
    date: { type: String, required: true },
    requestsUsed: { type: Number, default: 0 },
    tokensUsed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

apiUsageSchema.index({ providerId: 1, agentName: 1, date: 1 }, { unique: true });

apiUsageSchema.statics.getUsage = async function (providerId, agentName) {
  const date = getISTDateString();
  let usage = await this.findOne({ providerId, agentName, date });
  if (!usage) {
    try {
      usage = await this.create({ providerId, agentName, date });
    } catch (e) {
      // Race condition - another request created it first
      usage = await this.findOne({ providerId, agentName, date });
    }
  }
  return usage;
};

apiUsageSchema.statics.incrementUsage = async function (providerId, agentName, tokens = 0) {
  const date = getISTDateString();
  return this.findOneAndUpdate(
    { providerId, agentName, date },
    { $inc: { requestsUsed: 1, tokensUsed: tokens } },
    { upsert: true, new: true }
  );
};

apiUsageSchema.statics.getTodayAll = async function () {
  return this.find({ date: getISTDateString() }).lean();
};

apiUsageSchema.statics.getISTDate = getISTDateString;

const ApiUsage = mongoose.model("ApiUsage", apiUsageSchema);
module.exports = ApiUsage;
