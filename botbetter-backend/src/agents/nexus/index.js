const { detectIntent } = require("./router");
const { runBuddy } = require("../buddy");
const { runFinio } = require("../finio");
const { runPrepify } = require("../prepify");
const { runFlexAI } = require("../flexai");
const { runCreato } = require("../creato");
const { runSellio } = require("../sellio");
const { runCracky } = require("../cracky");

const AGENT_RUNNERS = {
  buddy:   runBuddy,
  finio:   runFinio,
  prepify: runPrepify,
  flexai:  runFlexAI,
  creato:  runCreato,
  sellio:  runSellio,
  cracky:  runCracky,
};

async function runNexus(userId, userMessage, opts = {}) {
  try {
    const agentName = detectIntent(userMessage);
    console.log(`[Nexus] Routing "${userMessage.slice(0, 50)}..." → ${agentName} (personality: ${opts.personality || "maya"})`);

    const runner = AGENT_RUNNERS[agentName];
    if (!runner) {
      return runBuddy(userId, userMessage, opts);
    }

    return await runner(userId, userMessage, opts);
  } catch (e) {
    console.error("Nexus error:", e.message);
    return "Sorry yaar, thoda issue aa gaya. Dobara try karo! 🙏";
  }
}

module.exports = { runNexus };
