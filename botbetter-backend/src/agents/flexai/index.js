const { getMemory } = require("../../models/Memory.model");
const { getFlexAIPrompt } = require("./prompt");
const { callAI } = require("../../utils/aiCaller");

async function runFlexAI(userId, userMessage) {
  try {
    const memory = await getMemory(userId);
    const systemPrompt = getFlexAIPrompt(memory);

    const history = memory.getAgentHistory("flexai", 8).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

    const { reply } = await callAI(
      "flexai",
      [...history, { role: "user", content: userMessage }],
      systemPrompt
    );

    await memory.addMessage("flexai", "user", userMessage);
    await memory.addMessage("flexai", "assistant", reply);

    return reply;
  } catch (e) {
    console.error("FlexAI error:", e.message);
    return "Sorry yaar, thoda issue aa gaya. Dobara try karo! 🙏";
  }
}

module.exports = { runFlexAI };
