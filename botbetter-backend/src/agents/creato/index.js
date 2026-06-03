const { getMemory } = require("../../models/Memory.model");
const { getCreatoPrompt } = require("./prompt");
const { callAI } = require("../../utils/aiCaller");

async function runCreato(userId, userMessage) {
  try {
    const memory = await getMemory(userId);
    const systemPrompt = getCreatoPrompt(memory);

    const history = memory.getAgentHistory("creato", 8).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

    const { reply } = await callAI(
      "creato",
      [...history, { role: "user", content: userMessage }],
      systemPrompt
    );

    await memory.addMessage("creato", "user", userMessage);
    await memory.addMessage("creato", "assistant", reply);

    return reply;
  } catch (e) {
    console.error("Creato error:", e.message);
    return "Sorry yaar, thoda issue aa gaya. Dobara try karo! 🙏";
  }
}

module.exports = { runCreato };
