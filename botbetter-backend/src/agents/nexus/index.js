const { detectIntent } = require("./router");
const { getMemory } = require("../../models/Memory.model");
const { runBuddy } = require("../buddy");
const { runFinio } = require("../finio");
const { runPrepify } = require("../prepify");
const { runFlexAI } = require("../flexai");
const { runCreato } = require("../creato");
const { runSellio } = require("../sellio");
const { runCracky } = require("../cracky");
const { callAI } = require("../../utils/aiCaller");
const { getNexusPrompt } = require("./prompt");
const { detectQueryType } = require("../../config/apiRouter");
const { getRagContext } = require("../../rag/ragSystem");

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
    if (detectQueryType(userMessage) === "real_time") {
      const memory = await getMemory(userId);
      const ragContext = await getRagContext(userMessage);
      const systemPrompt = getNexusPrompt(memory, { ...opts, ragContext });
      const history = memory.getAgentHistory("nexus", 8).map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));
      const result = await callAI("nexus", [...history, { role: "user", content: userMessage }], systemPrompt);
      await memory.addMessage("nexus", "user", userMessage);
      await memory.addMessage("nexus", "assistant", result.reply);
      return result.reply;
    }

    const agentName = detectIntent(userMessage);
    console.log(`[Nexus] Routing "${userMessage.slice(0, 50)}..." → ${agentName} (personality: ${opts.personality || "maya"})`);

    const runner = AGENT_RUNNERS[agentName] || runBuddy;
    const reply = await runner(userId, userMessage, opts);

    // Save under "nexus" so the sidebar history panel shows all conversations
    try {
      const memory = await getMemory(userId);
      await memory.addMessage("nexus", "user", userMessage);
      await memory.addMessage("nexus", "assistant", reply);
    } catch (saveErr) {
      console.error("[Nexus] History save error (non-critical):", saveErr.message);
    }

    return reply;
  } catch (e) {
    console.error("Nexus error:", e.message);
    return "Kuch issue aa gaya yaar. Ek baar dobara try karo!";
  }
}

module.exports = { runNexus };
