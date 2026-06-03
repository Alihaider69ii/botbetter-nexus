const { getMemory } = require("../../models/Memory.model");
const { getPrepifyPrompt } = require("./prompt");
const { callAI } = require("../../utils/aiCaller");

async function runPrepify(userId, userMessage) {
  try {
    const memory = await getMemory(userId);
    const systemPrompt = getPrepifyPrompt(memory);

    const history = memory.getAgentHistory("prepify", 8).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

    const { reply } = await callAI(
      "prepify",
      [...history, { role: "user", content: userMessage }],
      systemPrompt
    );

    await memory.addMessage("prepify", "user", userMessage);
    await memory.addMessage("prepify", "assistant", reply);

    return reply;
  } catch (e) {
    console.error("Prepify error:", e.message);
    return "Sorry yaar, thoda issue aa gaya. Dobara try karo! 🙏";
  }
}

module.exports = { runPrepify };
