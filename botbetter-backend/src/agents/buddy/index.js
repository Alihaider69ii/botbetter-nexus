const { getMemory } = require("../../models/Memory.model");
const { getBuddyPrompt } = require("./prompt");
const { callAI } = require("../../utils/aiCaller");

async function runBuddy(userId, userMessage, opts = {}) {
  try {
    const memory = await getMemory(userId);
    const systemPrompt = getBuddyPrompt(memory, opts);

    const history = memory.getAgentHistory("buddy", 8).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

    const { reply } = await callAI(
      "buddy",
      [...history, { role: "user", content: userMessage }],
      systemPrompt
    );

    await memory.addMessage("buddy", "user", userMessage);
    await memory.addMessage("buddy", "assistant", reply);

    return reply;
  } catch (e) {
    console.error("Buddy error:", e.message);
    return "Sorry yaar, thoda issue aa gaya. Dobara try karo! 🙏";
  }
}

module.exports = { runBuddy };
