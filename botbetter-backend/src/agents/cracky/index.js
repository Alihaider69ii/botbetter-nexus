const { getMemory } = require("../../models/Memory.model");
const { getCrackyPrompt } = require("./prompt");
const { callAI } = require("../../utils/aiCaller");

async function runCracky(userId, userMessage) {
  try {
    const memory = await getMemory(userId);
    const systemPrompt = getCrackyPrompt(memory);

    const history = memory.getAgentHistory("cracky", 8).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

    const { reply } = await callAI(
      "cracky",
      [...history, { role: "user", content: userMessage }],
      systemPrompt
    );

    await memory.addMessage("cracky", "user", userMessage);
    await memory.addMessage("cracky", "assistant", reply);

    return reply;
  } catch (e) {
    console.error("Cracky error:", e.message);
    return "Sorry yaar, thoda issue aa gaya. Dobara try karo!";
  }
}

module.exports = { runCracky };
