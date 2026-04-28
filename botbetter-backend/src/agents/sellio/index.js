const { ChatGroq } = require("@langchain/groq");
const config = require("../../config/env");
const { getMemory } = require("../../models/Memory.model");
const { getSellioPrompt } = require("./prompt");

const model = new ChatGroq({
  apiKey: config.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
});

async function runSellio(userId, userMessage) {
  try {
    const memory = await getMemory(userId);
    const systemPrompt = getSellioPrompt(memory);

    const history = memory
      .getAgentHistory("sellio", 8)
      .map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));

    const response = await model.invoke([
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: userMessage },
    ]);

    const reply = response.content;

    // Save to memory
    await memory.addMessage("sellio", "user", userMessage);
    await memory.addMessage("sellio", "assistant", reply);

    return reply;
  } catch (e) {
    console.error("Sellio error:", e.message);
    return "Sorry bhai, thoda issue aa gaya. Dobara try karo!";
  }
}

module.exports = { runSellio };