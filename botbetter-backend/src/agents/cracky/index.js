const { ChatGroq } = require("@langchain/groq");
const config = require("../../config/env");
const { getMemory } = require("../../models/Memory.model");
const { getCrackyPrompt } = require("./prompt");

const model = new ChatGroq({
  apiKey: config.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
});

async function runCracky(userId, userMessage) {
  try {
    const memory = await getMemory(userId);
    const systemPrompt = getCrackyPrompt(memory);

    const history = memory
      .getAgentHistory("cracky", 8)
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

    await memory.addMessage("cracky", "user", userMessage);
    await memory.addMessage("cracky", "assistant", reply);

    return reply;
  } catch (e) {
    console.error("Cracky error:", e.message);
    return "Sorry yaar, thoda issue aa gaya. Dobara try karo!";
  }
}

module.exports = { runCracky };