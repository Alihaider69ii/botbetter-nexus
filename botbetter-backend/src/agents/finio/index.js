const { getMemory } = require("../../models/Memory.model");
const { getFinioPrompt } = require("./prompt");
const { getFinioTools } = require("./tools");
const { callAI } = require("../../utils/aiCaller");

async function runFinio(userId, userMessage) {
  try {
    const memory = await getMemory(userId);
    const systemPrompt = getFinioPrompt(memory);
    const tools = getFinioTools(userId);

    const history = memory.getAgentHistory("finio", 8).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

    const { reply } = await callAI(
      "finio",
      [...history, { role: "user", content: userMessage }],
      systemPrompt,
      tools
    );

    await memory.addMessage("finio", "user", userMessage);
    await memory.addMessage("finio", "assistant", reply);

    return reply;
  } catch (e) {
    console.error("Finio error:", e.message);
    return "Sorry yaar, thoda issue aa gaya. Dobara try karo! 🙏";
  }
}

module.exports = { runFinio };
