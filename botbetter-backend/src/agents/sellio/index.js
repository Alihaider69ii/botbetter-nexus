const { getMemory } = require("../../models/Memory.model");
const { getSellioPrompt } = require("./prompt");
const { callAI } = require("../../utils/aiCaller");

async function runSellio(userId, userMessage) {
  try {
    const memory = await getMemory(userId);
    const systemPrompt = getSellioPrompt(memory);

    const history = memory.getAgentHistory("sellio", 8).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

    const { reply } = await callAI(
      "sellio",
      [...history, { role: "user", content: userMessage }],
      systemPrompt
    );

    await memory.addMessage("sellio", "user", userMessage);
    await memory.addMessage("sellio", "assistant", reply);

    return reply;
  } catch (e) {
    console.error("Sellio error:", e.message);
    return "Sorry bhai, thoda issue aa gaya. Dobara try karo!";
  }
}

module.exports = { runSellio };
